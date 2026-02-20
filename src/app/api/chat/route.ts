import Anthropic from "@anthropic-ai/sdk";
import { APEX_SYSTEM_PROMPT } from "@/lib/apex-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
// Paywall removed — rate limiting stays for abuse prevention

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
      // Continue without rate limiting if Redis fails
    }

    if (rateLimited) {
      return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { messages } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: APEX_SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
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
    console.error("Chat route top-level error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
