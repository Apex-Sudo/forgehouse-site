import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { COLIN_SYSTEM_PROMPT } from "@/lib/agent/prompts/colin-system-prompt";
import { validateApiKey } from "@/lib/api-keys";
import { isSubscribed } from "@/lib/subscription";
import { captureServerEvent } from "@/lib/posthog";

const MENTOR_PROMPTS: Record<string, string> = {
  "colin-chapman": COLIN_SYSTEM_PROMPT,
};

const AVAILABLE_MENTORS = Object.keys(MENTOR_PROMPTS);

export async function POST(req: Request) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Missing or invalid Authorization header. Use: Bearer fh_..." },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Check subscription
    const active = await isSubscribed(keyData.email);
    if (!active) {
      return Response.json(
        { error: "Active subscription required. Subscribe at https://forgehouse.io/pricing" },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { mentor, message, messages: msgArray } = body as {
      mentor?: string;
      message?: string;
      messages?: { role: "user" | "assistant"; content: string }[];
    };

    if (!mentor) {
      return Response.json(
        { error: "Missing 'mentor' field", available_mentors: AVAILABLE_MENTORS },
        { status: 400 }
      );
    }

    const systemPrompt = MENTOR_PROMPTS[mentor];
    if (!systemPrompt) {
      return Response.json(
        { error: `Unknown mentor: ${mentor}`, available_mentors: AVAILABLE_MENTORS },
        { status: 404 }
      );
    }

    // Accept either a single message string or a messages array
    let chatMessages: { role: "user" | "assistant"; content: string }[];
    if (msgArray && Array.isArray(msgArray)) {
      chatMessages = msgArray;
    } else if (message && typeof message === "string") {
      chatMessages = [{ role: "user", content: message }];
    } else {
      return Response.json(
        { error: "Provide either 'message' (string) or 'messages' (array)" },
        { status: 400 }
      );
    }

    // Check for stream preference
    const wantsStream = body.stream !== false; // default to streaming

    after(async () => {
      await captureServerEvent(keyData.email, "api_message_sent", {
        mentor_slug: mentor,
        via: "api_v1",
        message_count: chatMessages.length,
      });
    });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (!wantsStream) {
      // Non-streaming response
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: chatMessages,
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      after(async () => {
        await captureServerEvent(keyData.email, "api_message_received", {
          mentor_slug: mentor,
          via: "api_v1",
          response_length: text.length,
        });
      });

      return Response.json({
        mentor,
        response: text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
      });
    }

    // Streaming response
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: chatMessages,
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

          after(async () => {
            await captureServerEvent(keyData.email, "api_message_received", {
              mentor_slug: mentor,
              via: "api_v1",
              response_length: fullResponse.length,
            });
          });
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
    console.error("API v1 chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// GET endpoint for listing available mentors
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const keyData = await validateApiKey(apiKey);
  if (!keyData) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  return Response.json({
    mentors: AVAILABLE_MENTORS.map((slug) => ({
      slug,
      name: slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
    })),
  });
}
