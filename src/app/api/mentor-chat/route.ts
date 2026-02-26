import Anthropic from "@anthropic-ai/sdk";
import { COLIN_SYSTEM_PROMPT } from "@/lib/colin-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";

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
    const { messages, mentor } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      mentor: string;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = MENTOR_PROMPTS[mentor];
    if (!systemPrompt) {
      return Response.json({ error: "Unknown mentor" }, { status: 404 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
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
    console.error("Mentor chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
