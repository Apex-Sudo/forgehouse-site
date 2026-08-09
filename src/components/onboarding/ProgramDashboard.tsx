"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCheck, IconLock } from "@tabler/icons-react";
import ClipButton from "@/components/ui/ClipButton";
import CoverageMeter from "./CoverageMeter";
import ModuleChat from "./ModuleChat";
import type { Coverage, ModuleType } from "@/lib/extraction/modules";

interface ModuleSummary {
  type: ModuleType;
  label: string;
  summary: string;
  detail: string;
  minutes: number;
  suggestedDay: number;
  acceptsArtifacts: boolean;
  status: "locked" | "available" | "in_progress" | "complete";
  coverage: Coverage;
  exchanges: number;
  artifactCount: number;
}

interface ProgramState {
  mentorName: string;
  totalMinutes: number;
  coverage: Coverage;
  overall: number;
  modules: ModuleSummary[];
}

const STATUS_CHIP: Record<ModuleSummary["status"], string> = {
  complete: "bg-accent/15 text-accent",
  in_progress: "bg-white/10 text-foreground",
  available: "bg-white/8 text-muted",
  locked: "bg-white/5 text-faint",
};

const STATUS_LABEL: Record<ModuleSummary["status"], string> = {
  complete: "Done",
  in_progress: "In progress",
  available: "Ready",
  locked: "Locked",
};

/**
 * The mentor's home for the 2-week program. Deliberately shows every session
 * up front with its time cost, so nobody is surprised by an 8-hour sitting —
 * and shows coverage per dimension so progress is legible, not a vibe.
 */
export default function ProgramDashboard({
  onboardingId,
}: {
  onboardingId: string;
}) {
  const [state, setState] = useState<ProgramState | null>(null);
  const [active, setActive] = useState<ModuleType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/onboarding/${onboardingId}/modules`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not load your program.");
      }
      setState(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your program.");
    }
  }, [onboardingId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (active) {
    return (
      <ModuleChat
        onboardingId={onboardingId}
        moduleType={active}
        onBack={() => {
          setActive(null);
          void load();
        }}
        onChanged={load}
      />
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16 text-center">
        <h2 className="text-[24px] text-foreground mb-2">Something went wrong</h2>
        <p className="mono text-[12px] text-muted">{error}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="mono text-[12px] tracking-[0.04em] text-muted">
          Loading your program…
        </p>
      </div>
    );
  }

  const done = state.modules.filter((m) => m.status === "complete").length;
  const remaining = state.modules
    .filter((m) => m.status !== "complete")
    .reduce((sum, m) => sum + m.minutes, 0);
  const next = state.modules.find(
    (m) => m.status === "available" || m.status === "in_progress"
  );

  return (
    <div className="overflow-y-auto fh-scroll h-full px-6 py-10">
      <div className="max-w-[900px] mx-auto">
        {/* Overview */}
        <p className="mono text-[11px] uppercase tracking-[0.08em] text-accent mb-3">
          Your program
        </p>
        <h1 className="text-[38px] md:text-[46px] leading-[0.95] text-foreground">
          {done === state.modules.length
            ? "Every session is done."
            : "Short sessions, spread over two weeks."}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted max-w-[620px]">
          {done === state.modules.length
            ? "We have what we need to build your agent. You can revisit any session to add more."
            : `Seven sessions, none longer than ${Math.max(...state.modules.map((m) => m.minutes))} minutes. Do one a day, or several in an evening — it saves as you go, so you can stop mid-sentence and come back.`}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mono text-[11px] tracking-[0.04em] text-muted">
            {done} of {state.modules.length} sessions done
          </span>
          {remaining > 0 && (
            <span className="mono text-[11px] tracking-[0.04em] text-faint">
              ~{remaining} min left in total
            </span>
          )}
        </div>

        {next && (
          <div className="mt-7 max-w-[280px]">
            <ClipButton onClick={() => setActive(next.type)} variant="paper">
              {next.status === "in_progress"
                ? `Continue ${next.label.toLowerCase()}`
                : `Start ${next.label.toLowerCase()}`}
            </ClipButton>
          </div>
        )}

        {/* Coverage */}
        <div className="mt-12 rounded-md border border-border bg-surface p-6">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="text-[20px] text-foreground">What we&apos;ve captured</h2>
            <span className="mono text-[11px] text-muted">
              {Math.round(state.overall * 100)}% overall
            </span>
          </div>
          <CoverageMeter coverage={state.coverage} />
          <p className="mono mt-5 text-[10px] leading-relaxed tracking-[0.04em] text-faint">
            Each session moves different bars. Low bars aren&apos;t failures — they
            just show what the remaining sessions are for.
          </p>
        </div>

        {/* Sessions */}
        <h2 className="mt-12 mb-5 text-[20px] text-foreground">Sessions</h2>
        <div className="space-y-3">
          {state.modules.map((m) => {
            const locked = m.status === "locked";
            return (
              <div
                key={m.type}
                className={`rounded-md border p-5 transition ${
                  locked
                    ? "border-border bg-surface/40"
                    : "border-border bg-surface hover:border-accent/30"
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span
                        className={`mono rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] ${STATUS_CHIP[m.status]}`}
                      >
                        {m.status === "complete" ? (
                          <span className="inline-flex items-center gap-1">
                            <IconCheck size={11} stroke={2.5} />
                            {STATUS_LABEL[m.status]}
                          </span>
                        ) : locked ? (
                          <span className="inline-flex items-center gap-1">
                            <IconLock size={11} stroke={2} />
                            {STATUS_LABEL[m.status]}
                          </span>
                        ) : (
                          STATUS_LABEL[m.status]
                        )}
                      </span>
                      <span className="mono text-[10px] tracking-[0.04em] text-faint">
                        ~{m.minutes} min · suggested day {m.suggestedDay}
                      </span>
                    </div>

                    <h3
                      className={`text-[21px] leading-tight ${locked ? "text-muted" : "text-foreground"}`}
                    >
                      {m.label}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                      {locked ? m.summary : m.detail}
                    </p>

                    {m.exchanges > 0 && (
                      <p className="mono mt-3 text-[10px] tracking-[0.04em] text-faint">
                        {m.exchanges} replies
                        {m.artifactCount > 0 && ` · ${m.artifactCount} document${m.artifactCount > 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>

                  {!locked && (
                    <div className="w-[150px] shrink-0">
                      <ClipButton
                        onClick={() => setActive(m.type)}
                        variant={m.status === "complete" ? "tan" : "paper"}
                      >
                        {m.status === "complete"
                          ? "Revisit"
                          : m.status === "in_progress"
                            ? "Continue"
                            : "Start"}
                      </ClipButton>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mono mt-10 text-[10px] leading-relaxed tracking-[0.04em] text-faint">
          Sessions unlock in order — each one builds on what the last established.
        </p>
      </div>
    </div>
  );
}
