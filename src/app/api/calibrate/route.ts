import Anthropic from "@anthropic-ai/sdk";
import { CALIBRATION_SYSTEM_PROMPT } from "@/lib/calibration-system-prompt";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Take a break and come back." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, mentorSlug, extractionContext } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    mentorSlug?: string;
    extractionContext?: string;
  };

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let systemPrompt = CALIBRATION_SYSTEM_PROMPT;
  if (mentorSlug) {
    systemPrompt += `\n\nYou are calibrating the agent for mentor: ${mentorSlug}.`;
  }
  if (extractionContext) {
    systemPrompt += `\n\n## Extraction Summary\nHere is what was captured during the extraction sessions. Use this to simulate agent responses and create relevant scenarios:\n\n${extractionContext}`;
  }

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
}
