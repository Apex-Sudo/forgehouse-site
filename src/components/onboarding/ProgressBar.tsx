"use client";

import React from "react";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconHammer,
  IconRocket,
  IconScale,
} from "@tabler/icons-react";

export type OnboardingPhaseId = "extraction" | "calibration" | "ingestion";

interface ProgressBarProps {
  currentPhase: OnboardingPhaseId;
  onPhaseChange: (phase: OnboardingPhaseId) => void;
  variant?: "full" | "compact";
  onExpand?: () => void;
  onCollapse?: () => void;
}

const PHASE_ORDER: OnboardingPhaseId[] = ["extraction", "calibration", "ingestion"];

const PHASE_META: Record<
  OnboardingPhaseId,
  { label: string; Icon: React.ComponentType<{ size?: number; className?: string; stroke?: number }> }
> = {
  extraction: { label: "Contribution", Icon: IconHammer },
  calibration: { label: "Calibration", Icon: IconScale },
  ingestion: { label: "Launch", Icon: IconRocket },
};

const PHASE_HEADLINES: Record<OnboardingPhaseId, string> = {
  extraction: "Share your expertise",
  calibration: "Calibrate your voice",
  ingestion: "Review & go live",
};

const PHASE_SUBTEXT: Record<OnboardingPhaseId, string> = {
  extraction: "Capture how you think and help people",
  calibration: "Refine how your agent communicates",
  ingestion: "Confirm your knowledge base and go live",
};

function getPhaseStatus(phaseId: OnboardingPhaseId, currentPhase: OnboardingPhaseId) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const phaseIndex = PHASE_ORDER.indexOf(phaseId);
  if (phaseIndex < currentIndex) return "completed" as const;
  if (phaseIndex === currentIndex) return "active" as const;
  return "pending" as const;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPhase,
  onPhaseChange,
  variant = "full",
  onExpand,
  onCollapse,
}) => {
  if (variant === "compact") {
    const { label, Icon } = PHASE_META[currentPhase];
    return (
      <div className="flex w-full items-center justify-between gap-3 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/15 text-accent">
            <Icon size={18} stroke={1.75} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="mono text-[10px] uppercase tracking-[0.08em] text-faint">Current step</p>
            <p className="truncate text-[15px] text-foreground">{label}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {PHASE_ORDER.map((id) => {
            const st = getPhaseStatus(id, currentPhase);
            return (
              <span
                key={id}
                className={`h-1.5 w-1.5 rounded-full ${
                  st === "completed" ? "bg-accent" : st === "active" ? "bg-accent ring-2 ring-accent/30" : "bg-border-light"
                }`}
              />
            );
          })}
        </div>
        {onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            className="mono flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.06em] text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            Show steps
            <IconChevronDown size={16} stroke={1.75} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      {onCollapse ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onCollapse}
            className="mono flex cursor-pointer items-center gap-1 text-[11px] uppercase tracking-[0.06em] text-muted transition hover:text-foreground"
          >
            Hide steps
            <IconChevronUp size={16} stroke={1.75} />
          </button>
        </div>
      ) : null}
      <div className="mb-2 flex items-center justify-between">
        {PHASE_ORDER.map((phaseId) => {
          const status = getPhaseStatus(phaseId, currentPhase);
          const { label, Icon } = PHASE_META[phaseId];
          return (
            <div
              key={phaseId}
              className={`flex flex-1 flex-col items-center ${
                status === "completed" ? "cursor-pointer" : ""
              }`}
              onClick={() => status === "completed" && onPhaseChange(phaseId)}
            >
              <div
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                  status === "completed"
                    ? "border border-accent/40 bg-accent/15 text-accent"
                    : ""
                } ${
                  status === "active"
                    ? "border border-accent bg-accent text-[#1B1B18]"
                    : ""
                } ${status === "pending" ? "border border-border bg-surface-light text-muted" : ""}`}
              >
                {status === "completed" ? (
                  <IconCheck size={20} stroke={2.25} className="text-accent" />
                ) : (
                  <Icon
                    size={20}
                    stroke={1.75}
                    className={status === "pending" ? "text-muted" : "text-[#1B1B18]"}
                  />
                )}
              </div>
              <span
                className={`mono text-center text-[11px] uppercase tracking-[0.06em] ${
                  status === "active" ? "text-foreground" : ""
                } ${status === "pending" ? "text-faint" : ""} ${
                  status === "completed" ? "text-muted" : ""
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative pt-4">
        <div className="absolute top-0 left-0 h-1 w-full rounded-full bg-border" />
        <div
          className="absolute top-0 left-0 h-1 rounded-full bg-accent transition-all duration-500"
          style={{
            width:
              currentPhase === "extraction" ? "0%" : currentPhase === "calibration" ? "50%" : "100%",
          }}
        />
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-[22px] text-foreground">{PHASE_HEADLINES[currentPhase]}</h3>
        <p className="mono mt-1.5 text-[12px] text-muted">{PHASE_SUBTEXT[currentPhase]}</p>
      </div>
    </div>
  );
};

export default ProgressBar;
