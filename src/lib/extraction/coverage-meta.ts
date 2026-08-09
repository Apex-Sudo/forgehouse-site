/**
 * Machine-readable footer for extraction v2 module replies.
 *
 * v1 appended `{"complete":boolean}` — a single flag for a single interview.
 * v2 needs to know *what kind* of material a module actually produced, so the
 * footer carries a coverage vector as well. The delimiter is unchanged, and the
 * parser still accepts the v1 shape, so legacy sessions keep working.
 */

import type { Coverage, CoverageDimension } from "./modules";
import { COVERAGE_DIMENSIONS } from "./modules";

export const META_DELIMITER = "<<<FORGEHOUSE_EXTRACTION_META>>>";

export interface ModuleMeta {
  coverage: Coverage;
  complete: boolean;
  /**
   * Think-aloud only: scenarios put to the mentor and the answer they gave.
   * Retained as the golden set for calibrating the live agent later.
   */
  golden?: { scenario: string; mentorAnswer: string }[];
}

/** Strip the footer for display and storage. */
export function stripMeta(raw: string): string {
  const i = raw.indexOf(META_DELIMITER);
  if (i === -1) return raw;
  return raw.slice(0, i).replace(/\s+$/, "");
}

function clamp01(n: unknown): number | undefined {
  if (typeof n !== "number" || Number.isNaN(n)) return undefined;
  return Math.max(0, Math.min(1, n));
}

function parseCoverage(value: unknown): Coverage {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: Coverage = {};
  for (const dim of COVERAGE_DIMENSIONS) {
    const v = clamp01(src[dim]);
    if (v !== undefined) out[dim as CoverageDimension] = v;
  }
  return out;
}

function parseGolden(value: unknown): ModuleMeta["golden"] {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const e = entry as Record<string, unknown>;
      const scenario = typeof e.scenario === "string" ? e.scenario.trim() : "";
      const mentorAnswer =
        typeof e.mentorAnswer === "string" ? e.mentorAnswer.trim() : "";
      if (!scenario || !mentorAnswer) return null;
      return { scenario, mentorAnswer };
    })
    .filter((e): e is { scenario: string; mentorAnswer: string } => e !== null);
  return out.length > 0 ? out : undefined;
}

/**
 * Split a raw assistant reply into what the mentor sees and what the app uses.
 * A malformed or missing footer degrades to "not complete, no coverage" rather
 * than throwing — a model slip should never break the mentor's session.
 */
export function parseModuleReply(raw: string): {
  display: string;
  meta: ModuleMeta;
} {
  const idx = raw.indexOf(META_DELIMITER);
  const display = idx === -1 ? raw.trimEnd() : raw.slice(0, idx).trimEnd();

  const fallback: ModuleMeta = { coverage: {}, complete: false };
  if (idx === -1) return { display, meta: fallback };

  const tail = raw.slice(idx + META_DELIMITER.length).trim();
  // Tolerate the model wrapping the JSON in a fence despite instructions.
  const start = tail.indexOf("{");
  const end = tail.lastIndexOf("}");
  if (start === -1 || end <= start) return { display, meta: fallback };

  try {
    const parsed = JSON.parse(tail.slice(start, end + 1)) as Record<string, unknown>;
    return {
      display,
      meta: {
        coverage: parseCoverage(parsed.coverage),
        complete: parsed.complete === true,
        golden: parseGolden(parsed.golden),
      },
    };
  } catch {
    return { display, meta: fallback };
  }
}

/** The footer contract, appended to every module system prompt. */
export function metaInstructions(targets: readonly string[]): string {
  return `
**Mandatory machine-readable footer (every reply, no exceptions):**
After your natural-language reply to the mentor, append exactly one newline, then this delimiter line, then a single JSON object. Never wrap it in markdown fences. Never mention it to the mentor or ask them to act on it — it is for the app only.

Delimiter line (copy verbatim):
${META_DELIMITER}

JSON shape:
{"coverage":{${targets.map((t) => `"${t}":0.0`).join(",")}},"complete":false}

"coverage" values are your honest 0.0–1.0 estimate of how well THIS session has covered each dimension so far. Be conservative: 0.5 means you have solid material but would still ask more. Only approach 1.0 when another practitioner could act on what was captured.

"complete" stays false until every dimension above is at 0.7 or higher AND you have pressure-tested the thin spots with follow-ups. Do not set it true just because the mentor has been talking for a while.`;
}
