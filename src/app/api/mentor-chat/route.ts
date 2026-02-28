import Anthropic from "@anthropic-ai/sdk";
import { COLIN_SYSTEM_PROMPT } from "@/lib/colin-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getContextMessages, appendMessages } from "@/lib/conversations";
import { getScenario } from "@/lib/scenarios";

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
    const { messages, mentor, conversation_id, scenario_id } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      mentor: string;
      conversation_id?: string;
      scenario_id?: string;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = MENTOR_PROMPTS[mentor];
    if (!systemPrompt) {
      return Response.json({ error: "Unknown mentor" }, { status: 404 });
    }

    // Check auth for context injection + free tier enforcement
    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;

    // Enforce free tier limit for Colin (5 user messages max)
    if (mentor === "colin-chapman") {
      if (!user?.id) {
        return Response.json({ error: "Sign in to talk to Colin.", code: "AUTH_REQUIRED" }, { status: 401 });
      }

      const { data: userData } = await (await import("@/lib/supabase")).supabase
        .from("users")
        .select("subscribed, subscribed_mentor_slugs")
        .eq("id", user.id)
        .single();

      const isSubscribed = userData?.subscribed &&
        userData?.subscribed_mentor_slugs?.includes("colin-chapman");

      if (!isSubscribed) {
        const userMessageCount = messages.filter((m: { role: string }) => m.role === "user").length;
        if (userMessageCount > 5) {
          return Response.json({
            error: "You've used your 5 free messages. Subscribe to keep talking to Colin.",
            code: "FREE_LIMIT_REACHED",
          }, { status: 403 });
        }
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
