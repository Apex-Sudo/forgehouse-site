import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersTotal,
    users7d,
    users30d,
    subscribers,
    conversationsTotal,
    freeConversationsTotal,
    messages7d,
    mentorsTotal,
    mentorsActive,
    onboardingPhases,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("subscribed", true),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("free_tier_conversations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase.from("mentors").select("id", { count: "exact", head: true }),
    supabase
      .from("mentors")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("onboarding_sessions")
      .select("current_phase"),
  ]);

  const phaseCounts = { extraction: 0, calibration: 0, ingestion: 0, complete: 0 };
  if (onboardingPhases.data) {
    for (const row of onboardingPhases.data) {
      const phase = row.current_phase as keyof typeof phaseCounts;
      if (phase in phaseCounts) {
        phaseCounts[phase]++;
      }
    }
  }

  return NextResponse.json({
    users: {
      total: usersTotal.count ?? 0,
      last7d: users7d.count ?? 0,
      last30d: users30d.count ?? 0,
    },
    subscriptions: {
      active: subscribers.count ?? 0,
    },
    conversations: {
      total: (conversationsTotal.count ?? 0) + (freeConversationsTotal.count ?? 0),
      paid: conversationsTotal.count ?? 0,
      free: freeConversationsTotal.count ?? 0,
      messagesLast7d: messages7d.count ?? 0,
    },
    mentors: {
      total: mentorsTotal.count ?? 0,
      active: mentorsActive.count ?? 0,
      inactive: (mentorsTotal.count ?? 0) - (mentorsActive.count ?? 0),
    },
    onboarding: {
      total: onboardingPhases.data?.length ?? 0,
      phases: phaseCounts,
    },
  });
}
