import Anthropic from "@anthropic-ai/sdk";
import { APEX_SYSTEM_PROMPT } from "@/lib/apex-system-prompt";
import { chatLimiter } from "@/lib/rate-limit";
import { canAccess, incrementFreeMessages } from "@/lib/subscription";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { success } = await chatLimiter().limit(ip);
  if (!success) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, email } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    email?: string;
  };

  // Server-side access check: free conversation (by IP) or active subscription (by email)
  let access;
  try {
    access = await canAccess(ip, email);
  } catch (err) {
    return Response.json({ error: "Access check failed", detail: String(err) }, { status: 500 });
  }

  if (!access.allowed) {
    return Response.json(
      { error: "subscription_required", message: "Subscribe to continue chatting." },
      { status: 403 }
    );
  }

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
        // Increment free message count after successful response
        if (access.reason === "free") {
          await incrementFreeMessages(ip);
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
