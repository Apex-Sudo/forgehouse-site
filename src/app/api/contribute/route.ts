import Anthropic from "@anthropic-ai/sdk";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extraction-system-prompt";
import { extractLimiter } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { success } = await extractLimiter().limit(ip);
  if (!success) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Take a break and come back." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, mentorSlug } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    mentorSlug?: string;
  };

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = mentorSlug
    ? `${EXTRACTION_SYSTEM_PROMPT}\n\nYou are extracting from mentor: ${mentorSlug}. Adapt your questions to their domain once you learn what it is.`
    : EXTRACTION_SYSTEM_PROMPT;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  let fullAssistantResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullAssistantResponse += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        // After streaming completes, upsert to Supabase
        if (mentorSlug && fullAssistantResponse) {
          const allMessages = [
            ...messages,
            { role: "assistant" as const, content: fullAssistantResponse },
          ];
          const exchangeCount = allMessages.filter((m) => m.role === "user").length;

          supabase
            .from("fh_sessions")
            .upsert(
              {
                slug: mentorSlug,
                type: "extraction",
                messages: allMessages,
                exchange_count: exchangeCount,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "slug,type" }
            )
            .then(({ error }) => {
              if (error) console.error("Supabase upsert error:", error);
            });
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
}
