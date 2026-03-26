import Anthropic from "@anthropic-ai/sdk";
import { APEX_SYSTEM_PROMPT } from "@/lib/apex-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getContextMessages, getConversationMessages, appendMessages } from "@/lib/conversations";

type RawMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

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
    const {
      message,
      messages: clientMessages,
      conversation_id,
    } = body as {
      message: string;
      messages?: RawMessage[];
      conversation_id?: string;
    };

    if (!message?.trim()) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    const lastUserMessage: RawMessage = { role: "user", content: message };

    // Rehydrate conversation history: DB for authenticated, client array for anonymous
    let messages: RawMessage[];
    if (conversation_id) {
      const history = await getConversationMessages(conversation_id);
      messages = [...history, lastUserMessage];
    } else if (clientMessages?.length) {
      messages = clientMessages;
    } else {
      messages = [lastUserMessage];
    }

    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;

    let contextMessages: RawMessage[] = [];
    if (user?.id && user?.email) {
      try {
        contextMessages = await getContextMessages(user.id, "apex", user.email, 30, conversation_id);
      } catch (err) {
        console.error("Context fetch error:", err);
      }
    }

    let enrichedSystemPrompt = APEX_SYSTEM_PROMPT;

    if (user?.id) {
      try {
        const { data: profile } = await (await import("@/lib/supabase")).supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("profile_complete", true)
          .single();

        if (profile) {
          const userName = session?.user?.name || "Unknown";
          enrichedSystemPrompt += `\n\n--- User Profile ---
Name: ${userName}
Company: ${profile.company_description || "Unknown"}
Target Audience: ${profile.target_audience || "Unknown"}
Stage: ${profile.company_stage || "Unknown"}
Team Size: ${profile.team_size || "Unknown"}
Revenue: ${profile.revenue_range || "Unknown"}
Biggest Challenge: ${profile.biggest_challenge || "Unknown"}
Sales Process: ${profile.sales_process || "Unknown"}
--- End Profile ---
Use the user's first name naturally in conversation. Don't overdo it.`;
        }
      } catch {
        // Profile not found, continue without it
      }
    }

    if (contextMessages.length > 0) {
      const contextSummary = contextMessages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
      enrichedSystemPrompt = `${APEX_SYSTEM_PROMPT}\n\n--- Previous conversation context ---\n${contextSummary}\n--- End of context ---`;
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: enrichedSystemPrompt,
      messages,
    });

    let fullResponse = "";

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullResponse += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

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
        } catch (err) {
          const rawMsg = err instanceof Error ? err.message : "Unknown error";
          console.error("Stream error:", rawMsg);
          
          let userMsg = "Something went wrong. Please try again in a moment.";
          if (rawMsg.includes("credit balance") || rawMsg.includes("billing")) {
            userMsg = "I'm temporarily unavailable due to a system issue. Please try again in a few minutes.";
          } else if (rawMsg.includes("rate") || rawMsg.includes("429")) {
            userMsg = "I'm getting a lot of questions right now. Please try again in a moment.";
          } else if (rawMsg.includes("overloaded") || rawMsg.includes("529")) {
            userMsg = "I'm experiencing high demand. Please try again shortly.";
          }
          controller.enqueue(encoder.encode(`\n${userMsg}`));
        } finally {
          controller.close();
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
    console.error("Chat route top-level error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
