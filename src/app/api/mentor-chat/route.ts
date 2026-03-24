import { after } from "next/server";
import { AIMessageChunk } from "@langchain/core/messages";
import { COLIN_SYSTEM_PROMPT } from "@/lib/colin-system-prompt";
import { LEON_SYSTEM_PROMPT } from "@/lib/leon-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getContextMessages, appendMessages } from "@/lib/conversations";
import { canAccess, incrementAnonymousMessages, incrementAuthenticatedMessages } from "@/lib/subscription";
import { captureServerEvent } from "@/lib/posthog";
import { agentGraph } from "@/lib/agent/graph";
import { buildEnrichedPrompt } from "@/lib/agent/prompt-builder";
import { toLangChainMessages } from "@/lib/agent/messages";
import { encodeEvent } from "@/lib/agent/stream";
import { retrieveKnowledge } from "@/lib/agent/retrieval";
import { toolLog } from "@/lib/tool-logger";

const MENTOR_PROMPTS: Record<string, string> = {
  "colin-chapman": COLIN_SYSTEM_PROMPT,
  "leon-freier": LEON_SYSTEM_PROMPT,
};

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    //Rate limiting disabled during development
    let rateLimited = false;
    try {
      const { success } = await chatLimiter().limit(ip);
      rateLimited = !success;
    } catch (err) {
      console.error("Rate limit error:", err);
    }
    if (rateLimited) {
      return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { messages, mentor, conversation_id, scenario_id, invite } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      mentor: string;
      conversation_id?: string;
      scenario_id?: string;
      invite?: string;
    };

    // Valid invite codes bypass all gating (login + paywall)
    const VALID_INVITE_CODES = new Set(["alexw", "steve", "ray", "colin", "amber", "mark", "test"]);
    const isInvited = invite ? VALID_INVITE_CODES.has(invite) : false;

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = MENTOR_PROMPTS[mentor];
    if (!systemPrompt) {
      return Response.json({ error: "Unknown mentor" }, { status: 404 });
    }

    // Check auth for context injection
    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;

    // --- Tiered message gating (Redis-based) ---
    const effectiveEmail = user?.email || undefined;
    if (!isInvited) {
      const access = await canAccess(ip, effectiveEmail);
      if (!access.allowed) {
        if (access.reason === "login_required") {
          return Response.json({ error: "login_required" }, { status: 403 });
        }
        return Response.json({ error: "paywall" }, { status: 402 });
      }
    }

    const lastUserMessage = messages[messages.length - 1];

    // Detect return behavior
    let hoursSinceLastUserMessage: number | null = null;
    let isReturningConversation = false;
    if (user?.id && conversation_id) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: previousUserMessage } = await supabase
          .from("messages")
          .select("created_at")
          .eq("conversation_id", conversation_id)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (previousUserMessage?.created_at) {
          hoursSinceLastUserMessage =
            (Date.now() - new Date(previousUserMessage.created_at).getTime()) / (1000 * 60 * 60);
          isReturningConversation = hoursSinceLastUserMessage >= 6;
        }
      } catch (err) {
        console.error("Return detection error:", err);
      }
    }

    let contextMessages: { role: "user" | "assistant"; content: string }[] = [];
    if (user?.id && user?.email) {
      try {
        contextMessages = await getContextMessages(user.id, mentor, user.email);
      } catch (err) {
        console.error("Context fetch error:", err);
      }
    }

    // Build enriched system prompt
    let profile = null;
    if (user?.id) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("profile_complete", true)
          .single();
        profile = data;
      } catch {
        // Profile not found, continue without it
      }
    }

    const userMessageCount = messages.filter((m) => m.role === "user").length;

    let knowledgeChunks: string[] = [];
    try {
      const latestUserMsg = lastUserMessage?.content;
      if (latestUserMsg) {
        knowledgeChunks = await retrieveKnowledge(latestUserMsg, mentor);
      }
    } catch (err) {
      console.error("Knowledge retrieval failed (non-blocking):", err);
    }

    const enrichedSystemPrompt = buildEnrichedPrompt({
      basePrompt: systemPrompt,
      userName: session?.user?.name ?? undefined,
      profile,
      contextMessages,
      knowledgeChunks,
      scenarioId: scenario_id,
      userMessageCount,
    });

    const distinctId = user?.email || `anon:${ip}`;
    const messageNumber = userMessageCount;

    after(async () => {
      await captureServerEvent(distinctId, "message_sent", {
        mentor_slug: mentor,
        conversation_id: conversation_id || null,
        is_authenticated: Boolean(user?.email),
        is_invited: isInvited,
        message_length: typeof lastUserMessage?.content === "string" ? lastUserMessage.content.length : null,
        message_number: messageNumber,
      });

      if (isReturningConversation) {
        await captureServerEvent(distinctId, "conversation_returned", {
          mentor_slug: mentor,
          conversation_id: conversation_id || null,
          hours_since_last_message: hoursSinceLastUserMessage,
        });
      }
    });

    // --- LangGraph ReAct agent streaming (NDJSON) ---
    const langchainMessages = toLangChainMessages(messages);
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        let closed = false;

        const enqueue = (data: Uint8Array) => {
          if (closed) return;
          try {
            controller.enqueue(data);
          } catch {
            closed = true;
          }
        };

        const close = () => {
          if (closed) return;
          try {
            controller.close();
          } catch {
            // already closed
          }
          closed = true;
        };

        try {
          const stream = await agentGraph.stream(
            {
              messages: langchainMessages,
              systemPrompt: enrichedSystemPrompt,
              agentType: "mentor" as const,
              blocked: false,
              blockReason: "",
            },
            { streamMode: "messages" }
          );

          let streamChunkCount = 0;
          let toolCallCount = 0;
          toolLog("route", "Starting LangGraph stream...");

          for await (const [chunk, metadata] of stream) {
            streamChunkCount++;
            const isAgentToken = metadata.langgraph_node === "agent";
            const isGuardrailRefusal = metadata.langgraph_node === "inputGuardrail";
            const isToolResult = metadata.langgraph_node === "tools";

            if (isToolResult) {
              toolCallCount++;
              toolLog("route", `Tool result #${toolCallCount} from node "${metadata.langgraph_node}":`, typeof chunk.content === "string" ? chunk.content.slice(0, 500) : JSON.stringify(chunk.content).slice(0, 500));
            }

            if (isAgentToken && chunk instanceof AIMessageChunk) {
              const hasToolCalls = chunk.tool_calls && chunk.tool_calls.length > 0;
              if (hasToolCalls) {
                toolLog("route", "Agent requesting tool call:", JSON.stringify(chunk.tool_calls).slice(0, 500));
              }
            }

            if ((isAgentToken || isGuardrailRefusal) && chunk instanceof AIMessageChunk) {
              let text = "";
              if (typeof chunk.content === "string") {
                text = chunk.content;
              } else if (Array.isArray(chunk.content)) {
                for (const block of chunk.content) {
                  if (block.type === "text" && block.text) text += block.text;
                }
              }
              if (text) {
                fullResponse += text;
                enqueue(encodeEvent({ type: "text", content: text }));
              }
            }

            if (isToolResult && typeof chunk.content === "string" && chunk.content) {
              try {
                const toolResult = JSON.parse(chunk.content);
                if (toolResult.artifact) {
                  toolLog("route", "Artifact detected, streaming to client:", toolResult.artifact.id);
                  enqueue(encodeEvent({ type: "artifact", artifact: toolResult.artifact }));
                }
                if (toolResult.error) {
                  toolLog("route", "Tool returned error:", toolResult.error);
                }
              } catch {
                // tool result isn't artifact JSON
              }
            }
          }

          toolLog("route", `Stream finished. Total chunks: ${streamChunkCount}, tool results: ${toolCallCount}`);

          after(async () => {
            await captureServerEvent(distinctId, "message_received", {
              mentor_slug: mentor,
              conversation_id: conversation_id || null,
              response_length: fullResponse.length,
              message_number: messageNumber,
            });
          });

          if (user?.id && user?.email && conversation_id) {
            try {
              await appendMessages(conversation_id, user.id, user.email, [
                lastUserMessage,
                { role: "assistant", content: fullResponse },
              ]);
            } catch (err) {
              console.error("Failed to save messages:", err);
            }
          }

          if (effectiveEmail) {
            await incrementAuthenticatedMessages(effectiveEmail);
          } else {
            await incrementAnonymousMessages(ip);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toolLog("route", "STREAM ERROR:", msg);
          enqueue(encodeEvent({ type: "error", message: msg }));
        } finally {
          close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Mentor chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
