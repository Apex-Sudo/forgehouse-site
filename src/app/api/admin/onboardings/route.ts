import { NextResponse } from "next/server";
import { MODULE_TYPES } from "@/lib/extraction/modules";
import { supabase } from "@/lib/supabase";
import { requireAdminRoute } from "@/lib/admin-route-guard";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export type ReadinessStep =
  | "link_sent"
  | "extraction_complete"
  | "calibration_complete"
  | "ingestion_complete"
  | "profile_complete"
  | "agent_approved"
  | "launch_ready";

const ALL_STEPS: ReadinessStep[] = [
  "link_sent",
  "extraction_complete",
  "calibration_complete",
  "ingestion_complete",
  "profile_complete",
  "agent_approved",
  "launch_ready",
];

type MentorRow = {
  slug: string;
  name: string;
  active: boolean | null;
  bio: string | null;
  avatar_url: string | null;
  stripe_price_id: string | null;
  monthly_price: number | null;
};

function isProfileImageSet(avatar: string): boolean {
  if (!avatar) return false;
  if (/^https?:\/\//i.test(avatar)) return true;
  if (avatar.startsWith("/") && avatar.length > 1) return true;
  return false;
}

function isProfileComplete(m: MentorRow | undefined): boolean {
  if (!m) return false;
  const bio = (m.bio ?? "").trim();
  const avatar = (m.avatar_url ?? "").trim();
  const price = m.monthly_price ?? 0;
  if (bio.length === 0 || price <= 0) return false;
  return isProfileImageSet(avatar);
}

export interface EnrichedOnboarding {
  id: string;
  mentorName: string;
  email: string;
  slug: string;
  currentPhase: string;
  agentApproved: boolean;
  agentApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  extractionMessageCount: number;
  calibrationMessageCount: number;
  ingestionChunks: number | null;
  /** 1 = legacy three-phase flow, 2 = module program (Extraction 2.0). */
  programVersion: number;
  /** Module-program progress; zero for v1 sessions. */
  modulesDone: number;
  modulesTotal: number;
  mentorFound: boolean;
  mentorActive: boolean;
  mentorBio: string | null;
  mentorAvatarUrl: string | null;
  mentorStripePriceId: string | null;
  mentorMonthlyPrice: number | null;
  completedSteps: ReadinessStep[];
  totalSteps: number;
}

export async function GET() {
  await requireAdminRoute();

  const [sessionsRes, mentorsRes] = await Promise.all([
    supabase
      .from("onboarding_sessions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("mentors")
      .select(
        "slug, name, active, bio, avatar_url, stripe_price_id, monthly_price"
      ),
  ]);

  if (sessionsRes.error) {
    return NextResponse.json(
      { error: "Failed to fetch onboarding sessions" },
      { status: 500 }
    );
  }

  const mentorsBySlug = new Map<string, MentorRow>();
  if (mentorsRes.data) {
    for (const m of mentorsRes.data as MentorRow[]) {
      mentorsBySlug.set(m.slug, m);
    }
  }

  // v2 sessions keep their conversation in extraction_modules, not
  // extraction_data.messages — without this aggregation every module-program
  // mentor shows "0 messages" here no matter how far along they are.
  const moduleAgg = new Map<string, { done: number; messages: number }>();
  const v2Ids = (sessionsRes.data ?? [])
    .filter((s) => (s.program_version ?? 1) >= 2)
    .map((s) => s.id as string);
  if (v2Ids.length > 0) {
    const { data: moduleRows } = await supabase
      .from("extraction_modules")
      .select("onboarding_id, status, messages")
      .in("onboarding_id", v2Ids);
    for (const m of moduleRows ?? []) {
      const agg = moduleAgg.get(m.onboarding_id) ?? { done: 0, messages: 0 };
      if (m.status === "complete") agg.done += 1;
      agg.messages += Array.isArray(m.messages) ? m.messages.length : 0;
      moduleAgg.set(m.onboarding_id, agg);
    }
  }

  const enriched: EnrichedOnboarding[] = (sessionsRes.data ?? []).map((s) => {
    const slug = toSlug(s.mentor_name);
    const mentor = mentorsBySlug.get(slug);

    const extractionMsgs: unknown[] = s.extraction_data?.messages ?? [];
    const calibrationMsgs: unknown[] = s.calibration_data?.messages ?? [];
    const ingestionChunks: number | null =
      s.ingestion_data?.chunksCreated ?? null;

    const phase = s.current_phase as string;
    const agentApproved = Boolean(s.agent_approved);

    const completedSteps: ReadinessStep[] = [];

    completedSteps.push("link_sent");

    if (
      phase === "calibration" ||
      phase === "ingestion" ||
      phase === "complete"
    ) {
      completedSteps.push("extraction_complete");
    }
    if (phase === "ingestion" || phase === "complete") {
      completedSteps.push("calibration_complete");
    }
    if (phase === "complete") {
      completedSteps.push("ingestion_complete");
    }
    if (isProfileComplete(mentor)) {
      completedSteps.push("profile_complete");
    }
    if (agentApproved) {
      completedSteps.push("agent_approved");
    }
    if (
      phase === "complete" &&
      agentApproved &&
      isProfileComplete(mentor) &&
      mentor?.active
    ) {
      completedSteps.push("launch_ready");
    }

    const programVersion = (s.program_version as number | null) ?? 1;
    const agg = moduleAgg.get(s.id);

    return {
      id: s.id,
      mentorName: s.mentor_name,
      email: s.email,
      slug,
      currentPhase: phase,
      agentApproved,
      agentApprovedAt: s.agent_approved_at,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      expiresAt: s.expires_at,
      programVersion,
      modulesDone: agg?.done ?? 0,
      modulesTotal: MODULE_TYPES.length,
      extractionMessageCount:
        programVersion >= 2 ? (agg?.messages ?? 0) : extractionMsgs.length,
      calibrationMessageCount: calibrationMsgs.length,
      ingestionChunks,
      mentorFound: Boolean(mentor),
      mentorActive: Boolean(mentor?.active),
      mentorBio: mentor?.bio ?? null,
      mentorAvatarUrl: mentor?.avatar_url ?? null,
      mentorStripePriceId: mentor?.stripe_price_id ?? null,
      mentorMonthlyPrice: mentor?.monthly_price ?? null,
      completedSteps,
      totalSteps: ALL_STEPS.length,
    };
  });

  return NextResponse.json({ onboardings: enriched });
}
