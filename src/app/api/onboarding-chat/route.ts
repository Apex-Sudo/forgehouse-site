import { AIMessageChunk } from "@langchain/core/messages";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/onboarding-system-prompt";
import { auth } from "@/lib/auth";
import { agentGraph } from "@/lib/agent/graph";
import { toLangChainMessages } from "@/lib/agent/messages";
import { encodeEvent } from "@/lib/agent/stream";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) {
      return Response.json({ error: "Sign in required." }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const langchainMessages = toLangChainMessages(messages);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await agentGraph.stream(
            {
              messages: langchainMessages,
              systemPrompt: ONBOARDING_SYSTEM_PROMPT,
              agentType: "onboarding" as const,
              blocked: false,
              blockReason: "",
            },
            { streamMode: "messages" }
          );

          for await (const [chunk, metadata] of stream) {
            const isAgentToken = metadata.langgraph_node === "agent";
            const isGuardrailRefusal = metadata.langgraph_node === "inputGuardrail";

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
                controller.enqueue(encodeEvent({ type: "text", content: text }));
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encodeEvent({ type: "error", message: msg }));
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
    console.error("Onboarding chat error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
