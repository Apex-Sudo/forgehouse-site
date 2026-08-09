/**
 * Mentor Extraction 2.0 — module registry.
 *
 * The v1 flow was one 1–2 hour interview that asked about expertise in the
 * abstract. Experts are unreliable narrators of their own methods, so that
 * yields tidy-sounding frameworks that don't match what they actually do.
 *
 * v2 runs a battery of short modules that are *career agnostic by construction*:
 * every technique anchors on a specific real episode the mentor supplies and
 * walks its timeline. The domain only ever enters through their own material,
 * never through us, so the same battery works for a sales operator, a lawyer,
 * a physio or a short-term-rental host.
 */

export const MODULE_TYPES = [
  "domain_scan",
  "case_replay",
  "failure_autopsy",
  "think_aloud",
  "contrast_probe",
  "artifact_walkthrough",
  "boundary_mapping",
] as const;

export type ModuleType = (typeof MODULE_TYPES)[number];

export type ModuleStatus = "locked" | "available" | "in_progress" | "complete";

/**
 * Coverage dimensions. These are deliberately about the *shape* of what we
 * captured, not the subject matter — that keeps them domain-neutral.
 */
export const COVERAGE_DIMENSIONS = [
  "episodes",   // concrete, specific, dated things that actually happened
  "reasoning",  // visible decision logic: cues noticed, options weighed, why
  "heuristics", // transferable if/then rules, with their exceptions
  "boundaries", // where their expertise stops and how they say so
  "voice",      // how they actually phrase things
  "range",      // breadth across their domain, not just one favourite story
] as const;

export type CoverageDimension = (typeof COVERAGE_DIMENSIONS)[number];

export type Coverage = Partial<Record<CoverageDimension, number>>;

export interface ModuleDefinition {
  type: ModuleType;
  /** Order in the program; also the unlock order. */
  order: number;
  label: string;
  /** One line shown on the dashboard card. */
  summary: string;
  /** What the mentor is actually asked to do. */
  detail: string;
  /** Suggested minutes — used for expectation setting, never enforced. */
  minutes: number;
  /** Suggested day in the ~2 week program. Guidance only. */
  suggestedDay: number;
  /** Dimensions this module is responsible for moving. */
  targets: CoverageDimension[];
  /** Exchanges after which the module can be completed regardless of model signal. */
  escapeHatch: number;
  /** Whether this module accepts artifact uploads. */
  acceptsArtifacts?: boolean;
}

export const MODULES: ModuleDefinition[] = [
  {
    type: "domain_scan",
    order: 0,
    label: "Domain scan",
    summary: "Map your territory so later sessions skip what we already know.",
    detail:
      "A quick map of what you do, who you help, and the recurring situations you get pulled into. If you added existing content, this session only probes the gaps.",
    minutes: 20,
    suggestedDay: 1,
    targets: ["range", "voice"],
    escapeHatch: 14,
  },
  {
    type: "case_replay",
    order: 1,
    label: "Case replay",
    summary: "Walk a real case minute by minute, including the forks.",
    detail:
      "You pick a recent case that surprised you. We walk the timeline and stop at every decision point: what you noticed, what your options were, what tipped it.",
    minutes: 40,
    suggestedDay: 3,
    targets: ["episodes", "reasoning"],
    escapeHatch: 20,
  },
  {
    type: "failure_autopsy",
    order: 2,
    label: "Failure autopsy",
    summary: "The ones that went wrong, and the rule you took from each.",
    detail:
      "Where things went sideways. Not for the war story, but for the rule you now follow because of it. This is where non-negotiables actually come from.",
    minutes: 30,
    suggestedDay: 5,
    targets: ["episodes", "heuristics"],
    escapeHatch: 18,
  },
  {
    type: "think_aloud",
    order: 3,
    label: "Think aloud",
    summary: "React to live scenarios and narrate your reasoning as it happens.",
    detail:
      "We put three situations from your own field in front of you and you think out loud. Your answers are kept and later used to test whether your agent reasons the way you do.",
    minutes: 35,
    suggestedDay: 7,
    targets: ["reasoning", "heuristics"],
    escapeHatch: 18,
  },
  {
    type: "contrast_probe",
    order: 4,
    label: "Contrast probes",
    summary: "What everyone else does here, and why you don't.",
    detail:
      "For each common situation: what would a competent but average person in your field do, and what do you do instead? The gap between those two is the thing worth capturing.",
    minutes: 30,
    suggestedDay: 9,
    targets: ["heuristics", "voice"],
    escapeHatch: 16,
  },
  {
    type: "artifact_walkthrough",
    order: 5,
    label: "Artifact walkthrough",
    summary: "Narrate the decisions inside a real piece of your work.",
    detail:
      "Bring something real: a deck, a proposal, a plan, a report. We read it together and you explain the choices behind it. People talk far better over an artifact than into a void.",
    minutes: 35,
    suggestedDay: 11,
    targets: ["episodes", "reasoning", "range"],
    escapeHatch: 18,
    acceptsArtifacts: true,
  },
  {
    type: "boundary_mapping",
    order: 6,
    label: "Boundary mapping",
    summary: "Where your expertise stops, and how you say so.",
    detail:
      "The questions you'd hand to someone else. This is what stops your agent from confidently answering things you'd never answer.",
    minutes: 20,
    suggestedDay: 13,
    targets: ["boundaries", "range"],
    escapeHatch: 14,
  },
];

export const MODULE_BY_TYPE: Record<ModuleType, ModuleDefinition> = Object.fromEntries(
  MODULES.map((m) => [m.type, m])
) as Record<ModuleType, ModuleDefinition>;

export function isModuleType(value: string): value is ModuleType {
  return (MODULE_TYPES as readonly string[]).includes(value);
}

/** Total suggested minutes, for the "what am I signing up for" line. */
export const TOTAL_MINUTES = MODULES.reduce((sum, m) => sum + m.minutes, 0);

/**
 * Aggregate per-module coverage into a program-level vector.
 * Each dimension is the best value achieved by any module that targets it, so
 * a strong case replay isn't diluted by modules that never aimed at episodes.
 */
export function aggregateCoverage(
  modules: { moduleType: ModuleType; coverage: Coverage }[]
): Coverage {
  const out: Coverage = {};
  for (const dim of COVERAGE_DIMENSIONS) {
    let best = 0;
    for (const m of modules) {
      const v = m.coverage?.[dim];
      if (typeof v === "number" && v > best) best = v;
    }
    if (best > 0) out[dim] = Math.min(1, best);
  }
  return out;
}

/** 0..1 overall readiness, the mean across all dimensions. */
export function overallCoverage(coverage: Coverage): number {
  const total = COVERAGE_DIMENSIONS.reduce(
    (sum, d) => sum + (coverage[d] ?? 0),
    0
  );
  return total / COVERAGE_DIMENSIONS.length;
}

/**
 * Modules unlock in order: the next one opens when the previous completes.
 * Completed modules stay open so a mentor can go back and add more.
 */
export function statusesFor(
  completed: Set<ModuleType>,
  inProgress: Set<ModuleType>
): Record<ModuleType, ModuleStatus> {
  const out = {} as Record<ModuleType, ModuleStatus>;
  let unlockedUpTo = 0;
  for (const m of MODULES) {
    if (completed.has(m.type)) unlockedUpTo = Math.max(unlockedUpTo, m.order + 1);
  }
  for (const m of MODULES) {
    if (completed.has(m.type)) out[m.type] = "complete";
    else if (inProgress.has(m.type)) out[m.type] = "in_progress";
    else if (m.order <= unlockedUpTo) out[m.type] = "available";
    else out[m.type] = "locked";
  }
  return out;
}
