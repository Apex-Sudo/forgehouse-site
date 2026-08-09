/**
 * Server-side persistence for extraction v2 modules.
 *
 * Reached only from route handlers, which use the service-key Supabase client.
 * The onboarding session id is itself the bearer secret (mentors arrive by
 * magic link), so every function here takes it and callers must have already
 * validated the session exists and has not expired.
 */

import { supabase } from "@/lib/supabase";
import {
  MODULES,
  MODULE_BY_TYPE,
  aggregateCoverage,
  statusesFor,
  type Coverage,
  type ModuleStatus,
  type ModuleType,
} from "./modules";
import { summariseModuleForContext } from "./module-prompts";

export interface ModuleArtifact {
  name: string;
  chars: number;
  uploadedAt: string;
  /** Extracted text, kept for the prompt. The uploaded file is never stored. */
  text?: string;
}

export interface ModuleRecord {
  id: string;
  onboardingId: string;
  moduleType: ModuleType;
  status: ModuleStatus;
  messages: { role: "user" | "assistant"; content: string }[];
  coverage: Coverage;
  artifacts: ModuleArtifact[];
  goldenSet: { scenario: string; mentorAnswer: string }[];
  sortOrder: number;
  startedAt: string | null;
  completedAt: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): ModuleRecord {
  return {
    id: row.id,
    onboardingId: row.onboarding_id,
    moduleType: row.module_type,
    status: row.status,
    messages: Array.isArray(row.messages) ? row.messages : [],
    coverage: row.coverage ?? {},
    artifacts: Array.isArray(row.artifacts) ? row.artifacts : [],
    goldenSet: Array.isArray(row.golden_set) ? row.golden_set : [],
    sortOrder: row.sort_order ?? 0,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Create the seven module rows for a session if they don't exist yet, then
 * return them in program order. Idempotent — safe to call on every dashboard
 * load, which is what makes the program self-healing if a row is ever lost.
 */
export async function ensureModules(onboardingId: string): Promise<ModuleRecord[]> {
  const { data: existing, error } = await supabase
    .from("extraction_modules")
    .select("*")
    .eq("onboarding_id", onboardingId)
    .order("sort_order");

  if (error) throw new Error(`Failed to load modules: ${error.message}`);

  const present = new Set((existing ?? []).map((r) => r.module_type as ModuleType));
  const missing = MODULES.filter((m) => !present.has(m.type));

  if (missing.length > 0) {
    const rows = missing.map((m) => ({
      onboarding_id: onboardingId,
      module_type: m.type,
      // The first module is open immediately; the rest unlock in turn.
      status: m.order === 0 ? "available" : "locked",
      sort_order: m.order,
    }));
    const { error: insertError } = await supabase
      .from("extraction_modules")
      .insert(rows);
    // A concurrent request may have inserted these first; the unique
    // constraint makes that harmless, so re-read rather than fail.
    if (insertError && !insertError.message.includes("duplicate")) {
      throw new Error(`Failed to create modules: ${insertError.message}`);
    }
  }

  const { data: all, error: reloadError } = await supabase
    .from("extraction_modules")
    .select("*")
    .eq("onboarding_id", onboardingId)
    .order("sort_order");

  if (reloadError) throw new Error(`Failed to load modules: ${reloadError.message}`);
  return (all ?? []).map(mapRow);
}

export async function getModule(
  onboardingId: string,
  moduleType: ModuleType
): Promise<ModuleRecord | null> {
  const { data, error } = await supabase
    .from("extraction_modules")
    .select("*")
    .eq("onboarding_id", onboardingId)
    .eq("module_type", moduleType)
    .maybeSingle();
  if (error) throw new Error(`Failed to load module: ${error.message}`);
  return data ? mapRow(data) : null;
}

/**
 * Recompute unlock state across the whole program and push the aggregate
 * coverage onto the session. Called after any module changes.
 */
export async function reconcileProgram(onboardingId: string): Promise<ModuleRecord[]> {
  const modules = await ensureModules(onboardingId);

  const completed = new Set(
    modules.filter((m) => m.status === "complete").map((m) => m.moduleType)
  );
  const inProgress = new Set(
    modules.filter((m) => m.status === "in_progress").map((m) => m.moduleType)
  );
  const desired = statusesFor(completed, inProgress);

  const changes = modules.filter((m) => desired[m.moduleType] !== m.status);
  for (const m of changes) {
    // Only ever open things up here. Completion and start are explicit
    // transitions owned by the chat route.
    const next = desired[m.moduleType];
    if (m.status === "complete" || m.status === "in_progress") continue;
    if (next === m.status) continue;
    await supabase
      .from("extraction_modules")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", m.id);
    m.status = next;
  }

  const coverage = aggregateCoverage(
    modules.map((m) => ({ moduleType: m.moduleType, coverage: m.coverage }))
  );
  await supabase
    .from("onboarding_sessions")
    .update({ coverage, updated_at: new Date().toISOString() })
    .eq("id", onboardingId);

  return modules;
}

export interface ModulePatch {
  messages?: { role: "user" | "assistant"; content: string }[];
  coverage?: Coverage;
  status?: ModuleStatus;
  artifacts?: ModuleArtifact[];
  goldenSet?: { scenario: string; mentorAnswer: string }[];
}

export async function updateModule(
  onboardingId: string,
  moduleType: ModuleType,
  patch: ModulePatch
): Promise<ModuleRecord> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (patch.messages) updates.messages = patch.messages;
  if (patch.coverage) updates.coverage = patch.coverage;
  if (patch.artifacts) updates.artifacts = patch.artifacts;
  if (patch.goldenSet) updates.golden_set = patch.goldenSet;

  if (patch.status) {
    updates.status = patch.status;
    if (patch.status === "in_progress") updates.started_at = new Date().toISOString();
    if (patch.status === "complete") updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("extraction_modules")
    .update(updates)
    .eq("onboarding_id", onboardingId)
    .eq("module_type", moduleType)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update module: ${error?.message ?? "not found"}`);
  }
  return mapRow(data);
}

/**
 * Recap of every completed module before `moduleType`, injected as context so
 * later sessions build on earlier ones instead of re-treading them.
 */
export function buildPriorSummary(
  modules: ModuleRecord[],
  moduleType: ModuleType
): string {
  const order = MODULE_BY_TYPE[moduleType].order;
  return modules
    .filter((m) => m.sortOrder < order && m.messages.length > 0)
    .map((m) => summariseModuleForContext(m.moduleType, m.messages))
    .filter(Boolean)
    .join("\n\n");
}

/** Concatenated artifact text for a module, capped to protect the context window. */
export function artifactTextFor(module: ModuleRecord | null): string {
  if (!module) return "";
  const joined = module.artifacts
    .map((a) => a.text ?? "")
    .filter(Boolean)
    .join("\n\n---\n\n");
  return joined.length > 15000 ? `${joined.slice(0, 15000)}…` : joined;
}
