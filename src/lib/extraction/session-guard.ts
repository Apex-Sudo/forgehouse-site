/**
 * Shared guard for onboarding routes.
 *
 * Mentors arrive by magic link and are not signed in, so the session UUID is
 * the bearer credential. Every route therefore has to check the same three
 * things: the id is well-formed, the session exists, and it has not expired.
 */

import { supabase } from "@/lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GuardedSession {
  id: string;
  mentorName: string;
  email: string;
  programVersion: number;
  currentPhase: string;
}

export type GuardResult =
  | { ok: true; session: GuardedSession }
  | { ok: false; error: string; status: number };

export async function guardSession(id: string): Promise<GuardResult> {
  if (!UUID_REGEX.test(id)) {
    return { ok: false, error: "Invalid session ID format", status: 400 };
  }

  const { data, error } = await supabase
    .from("onboarding_sessions")
    .select("id, mentor_name, email, expires_at, program_version, current_phase")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "Onboarding session not found", status: 404 };
  }

  if (new Date() > new Date(data.expires_at)) {
    return { ok: false, error: "Onboarding session has expired", status: 410 };
  }

  return {
    ok: true,
    session: {
      id: data.id,
      mentorName: data.mentor_name ?? "",
      email: data.email ?? "",
      programVersion: data.program_version ?? 1,
      currentPhase: data.current_phase ?? "extraction",
    },
  };
}
