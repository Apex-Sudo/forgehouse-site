import Anthropic from "@anthropic-ai/sdk";
import { COLIN_SYSTEM_PROMPT } from "@/lib/colin-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getContextMessages, appendMessages } from "@/lib/conversations";
import { getScenario } from "@/lib/scenarios";
import { canAccess, incrementAnonymousMessages, incrementAuthenticatedMessages } from "@/lib/subscription";

const MENTOR_PROMPTS: Record<string, string> = {
  "colin-chapman": COLIN_SYSTEM_PROMPT,
};

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
    // 3 anonymous → login_required → 2 more authenticated → paywall
    // Invite codes bypass all gates
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

    let contextMessages: { role: "user" | "assistant"; content: string }[] = [];
    if (user?.id && user?.email) {
      try {
        contextMessages = await getContextMessages(user.id, mentor, user.email);
      } catch (err) {
        console.error("Context fetch error:", err);
      }
    }

    // Build system prompt with context
    let enrichedSystemPrompt = systemPrompt;

    // Inject user profile if available
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
      enrichedSystemPrompt = `${systemPrompt}\n\n--- Previous conversation context ---\n${contextSummary}\n--- End of context ---`;
    }

    // Add scenario-specific system prompt if in scenario mode
    if (scenario_id) {
      const scenario = getScenario(scenario_id);
      if (scenario) {
        const userAnswerCount = messages.filter((m) => m.role === "user").length;
        const totalQuestions = scenario.questions.length;
        const isLastQuestion = userAnswerCount >= totalQuestions;

        enrichedSystemPrompt += `\n\n--- SCENARIO MODE ---\n${scenario.systemPromptAddition}\n\nThe user is on answer ${userAnswerCount} of ${totalQuestions} questions.`;

        if (isLastQuestion) {
          enrichedSystemPrompt += `\nAll questions have been answered. Deliver the structured output NOW. Do not ask more questions.`;
        } else {
          const nextQuestion = scenario.questions[userAnswerCount];
          enrichedSystemPrompt += `\nAcknowledge their answer briefly, then ask this next question:\n"${nextQuestion}"\nDo NOT deliver the final structured output yet.`;
        }
      }
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: enrichedSystemPrompt,
      messages,
    });

    // Collect the full response for saving
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

          // Save messages to conversation if authenticated
          if (user?.id && user?.email && conversation_id) {
            const lastUserMessage = messages[messages.length - 1];
            try {
              await appendMessages(conversation_id, user.id, user.email, [
                lastUserMessage,
                { role: "assistant", content: fullResponse },
              ]);
            } catch (err) {
              console.error("Failed to save messages:", err);
            }
          }

          // Increment message count after successful completion
          if (effectiveEmail) {
            await incrementAuthenticatedMessages(effectiveEmail);
          } else {
            await incrementAnonymousMessages(ip);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encoder.encode(`\n[Error: ${msg}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Mentor chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
