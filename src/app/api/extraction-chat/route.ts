import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extraction-system-prompt";
import { auth } from "@/lib/auth";
import { extractLimiter } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { ExtractionAgentNode } from "@/lib/agent/nodes/ExtractionAgentNode";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success } = await extractLimiter().limit(ip);
    if (!success) {
      return Response.json(
        { error: "Rate limit exceeded. Take a break and come back." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, cvContent, onboardingSessionId } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      cvContent?: string;
      onboardingSessionId?: string;
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;

    let authorized = Boolean(user?.email);

    if (!authorized && onboardingSessionId && UUID_REGEX.test(onboardingSessionId)) {
      const { data, error } = await supabase
        .from("onboarding_sessions")
        .select("id, expires_at")
        .eq("id", onboardingSessionId)
        .single();

      if (!error && data) {
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now <= expiresAt) {
          authorized = true;
        }
      }
    }

    if (!authorized) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    let systemPrompt = EXTRACTION_SYSTEM_PROMPT;
    if (cvContent) {
      systemPrompt += `\n\nThe mentor has uploaded a CV/resume with the following content:\n\n${cvContent}`;
    }

    const node = new ExtractionAgentNode();
    const stream = node.run({ messages, systemPrompt });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Extraction chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
