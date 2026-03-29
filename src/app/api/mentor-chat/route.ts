import { after } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getContextMessages, getConversationMessages } from "@/lib/conversations";
import { canAccess, incrementAnonymousMessages, incrementAuthenticatedMessages } from "@/lib/subscription";
import { captureServerEvent } from "@/lib/posthog";
import { MentorAgentNode } from "@/lib/agent/nodes/MentorAgentNode";

type RawMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const {
      message,
      messages: clientMessages,
      mentor,
      conversation_id,
      scenario_id,
      invite,
    } = body as {
      message: string;
      messages?: RawMessage[];
      mentor: string;
      conversation_id?: string;
      scenario_id?: string;
      invite?: string;
    };

    const VALID_INVITE_CODES = new Set(["alexw", "steve", "ray", "colin", "amber", "mark", "test"]);
    const isInvited = invite ? VALID_INVITE_CODES.has(invite) : false;

    if (!message?.trim()) {
      return Response.json({ error: "No message provided" }, { status: 400 });
    }

    const { data: mentorRow } = await supabase
      .from("mentors")
      .select("system_prompt")
      .eq("slug", mentor)
      .eq("active", true)
      .single();
    if (!mentorRow) {
      return Response.json({ error: "Unknown mentor" }, { status: 404 });
    }
    const systemPrompt = mentorRow.system_prompt;

    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;

    const effectiveEmail = user?.email || undefined;
    if (!isInvited) {
      const access = await canAccess(ip, effectiveEmail);
      if (!access.allowed) {
        if (access.reason === "login_required") {
          return Response.json({ error: "login_required" }, { status: 403 });
        }
        return Response.json({ error: "paywall" }, { status: 402 });
      }
    }

    const lastUserMessage: RawMessage = { role: "user", content: message };

    // Rehydrate conversation history: DB for authenticated, client array for anonymous
    let messages: RawMessage[];
    if (conversation_id) {
      const history = await getConversationMessages(conversation_id);
      messages = [...history, lastUserMessage];
    } else if (clientMessages?.length) {
      messages = clientMessages;
    } else {
      messages = [lastUserMessage];
    }

    let hoursSinceLastUserMessage: number | null = null;
    let isReturningConversation = false;
    if (user?.id && conversation_id) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: previousUserMessage } = await supabase
          .from("messages")
          .select("created_at")
          .eq("conversation_id", conversation_id)
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (previousUserMessage?.created_at) {
          hoursSinceLastUserMessage =
            (Date.now() - new Date(previousUserMessage.created_at).getTime()) / (1000 * 60 * 60);
          isReturningConversation = hoursSinceLastUserMessage >= 6;
        }
      } catch (err) {
        console.error("Return detection error:", err);
      }
    }

    let contextMessages: { role: string; content: string }[] = [];
    if (user?.id && user?.email) {
      try {
        contextMessages = await getContextMessages(user.id, mentor, user.email, 30, conversation_id);
      } catch (err) {
        console.error("Context fetch error:", err);
      }
    }

    let profile = null;
    if (user?.id) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .eq("profile_complete", true)
          .single();
        profile = data;
      } catch {
        // Profile not found
      }
    }

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const distinctId = user?.email || `anon:${ip}`;

    after(async () => {
      await captureServerEvent(distinctId, "message_sent", {
        mentor_slug: mentor,
        conversation_id: conversation_id || null,
        is_authenticated: Boolean(user?.email),
        is_invited: isInvited,
        message_length: message.length,
        message_number: userMessageCount,
      });

      if (isReturningConversation) {
        await captureServerEvent(distinctId, "conversation_returned", {
          mentor_slug: mentor,
          conversation_id: conversation_id || null,
          hours_since_last_message: hoursSinceLastUserMessage,
        });
      }
    });

    let scenario = null;
    if (scenario_id) {
      const { data: scenarioRow } = await supabase
        .from("mentor_scenarios")
        .select("questions, system_prompt_addition")
        .eq("id", scenario_id)
        .single();
      if (scenarioRow) {
        scenario = scenarioRow;
      }
    }

    const node = new MentorAgentNode();
    const stream = node.run({
      messages,
      systemPrompt,
      mentorSlug: mentor,
      conversationId: conversation_id,
      userId: user?.id,
      userEmail: user?.email,
      userName: session?.user?.name ?? undefined,
      profile,
      contextMessages,
      scenario,
      userMessageCount,
      lastUserMessage,
    });

    after(async () => {
      await captureServerEvent(distinctId, "message_received", {
        mentor_slug: mentor,
        conversation_id: conversation_id || null,
        message_number: userMessageCount,
      });

      if (effectiveEmail) {
        await incrementAuthenticatedMessages(effectiveEmail);
      } else {
        await incrementAnonymousMessages(ip);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Mentor chat error:", err);
    return Response.json(
      { error: "Internal error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
