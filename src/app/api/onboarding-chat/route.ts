import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/agent/prompts/onboarding-system-prompt";
import { auth } from "@/lib/auth";
import { OnboardingAgentNode } from "@/lib/agent/nodes/OnboardingAgentNode";

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

    const node = new OnboardingAgentNode();
    const stream = node.run({
      messages,
      systemPrompt: ONBOARDING_SYSTEM_PROMPT,
    });

    return new Response(stream, {
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
