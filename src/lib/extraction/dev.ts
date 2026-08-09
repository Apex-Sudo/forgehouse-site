/**
 * Development-only affordance for walking the 7-module program without
 * answering every question by hand.
 *
 * The v1 prompts embed a magic phrase ("Progress me to the next galaxy") that
 * any mentor could type to skip a stage with fabricated answers. That is a
 * production backdoor: it lives in the model's instructions, so it works for
 * anyone, on any deployment, and leaves fabricated data in the knowledge base
 * that is indistinguishable from real answers.
 *
 * This replaces it with something that cannot fire in production: an env flag
 * that must be explicitly set, checked server-side, and never shipped to the
 * client. Modules skipped this way are marked so the fabricated coverage can
 * be told apart from the real thing.
 */

/** True only when explicitly enabled outside production. */
export function devSkipEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_EXTRACTION_DEV_SKIP === "true"
  );
}

/** Coverage stamped onto a dev-skipped module. */
export const DEV_SKIP_COVERAGE = {
  episodes: 1,
  reasoning: 1,
  heuristics: 1,
  boundaries: 1,
  voice: 1,
  range: 1,
} as const;
