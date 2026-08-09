"use client";

import { COVERAGE_DIMENSIONS, type Coverage } from "@/lib/extraction/modules";

const LABELS: Record<string, string> = {
  episodes: "Real cases",
  reasoning: "Reasoning",
  heuristics: "Rules",
  boundaries: "Boundaries",
  voice: "Voice",
  range: "Range",
};

/**
 * Coverage is shown as six honest bars rather than one percentage, because the
 * point is to make gaps legible — a mentor with great stories but no boundaries
 * should be able to see exactly that.
 */
export default function CoverageMeter({
  coverage,
  compact = false,
}: {
  coverage: Coverage;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-wrap gap-x-5 gap-y-2" : "grid sm:grid-cols-2 gap-x-8 gap-y-3"}>
      {COVERAGE_DIMENSIONS.map((dim) => {
        const value = Math.max(0, Math.min(1, coverage[dim] ?? 0));
        const pct = Math.round(value * 100);
        return (
          <div key={dim} className={compact ? "min-w-[92px]" : ""}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">
                {LABELS[dim] ?? dim}
              </span>
              <span className="mono text-[10px] text-muted">{pct}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
