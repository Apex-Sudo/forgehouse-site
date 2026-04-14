import { CALIBRATION_SYSTEM_PROMPT } from "@/lib/calibration-system-prompt";
import { extractLimiter } from "@/lib/rate-limit";
import { CalibrationAgentNode } from "@/lib/agent/nodes/CalibrationAgentNode";

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

  let systemPrompt = CALIBRATION_SYSTEM_PROMPT;
  if (mentorSlug) {
    systemPrompt += `\n\nYou are calibrating the agent for mentor: ${mentorSlug}.`;
  }
  if (extractionContext) {
    systemPrompt += `\n\n## Extraction Summary\nHere is what was captured during the extraction sessions. Use this to simulate agent responses and create relevant scenarios:\n\n${extractionContext}`;
  }

  const node = new CalibrationAgentNode();
  const stream = node.run({ messages, systemPrompt, mentorSlug });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
