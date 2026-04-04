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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E5E2DC] bg-white text-amber">
            <Icon size={18} stroke={1.75} className="text-amber" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#999]">Current step</p>
            <p className="truncate text-sm font-semibold text-[#1A1A1A]">{label}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {PHASE_ORDER.map((id) => {
            const st = getPhaseStatus(id, currentPhase);
            return (
              <span
                key={id}
                className={`h-1.5 w-1.5 rounded-full ${
                  st === "completed" ? "bg-amber" : st === "active" ? "bg-amber ring-2 ring-amber/30" : "bg-[#E5E2DC]"
                }`}
              />
            );
          })}
        </div>
        {onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E5E2DC] px-2.5 py-1.5 text-xs font-medium text-[#737373] transition hover:border-amber/40 hover:text-[#1A1A1A]"
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
            className="flex items-center gap-1 text-xs font-medium text-[#737373] transition hover:text-[#1A1A1A]"
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
                    ? "border border-amber/40 bg-amber/10 text-amber"
                    : ""
                } ${
                  status === "active"
                    ? "border border-[#E5E2DC] bg-white text-amber"
                    : ""
                } ${status === "pending" ? "bg-[#E5E2DC] text-[#999]" : ""}`}
              >
                {status === "completed" ? (
                  <IconCheck size={20} stroke={2.25} className="text-amber" />
                ) : (
                  <Icon size={20} stroke={1.75} className={status === "pending" ? "text-[#999]" : "text-amber"} />
                )}
              </div>
              <span
                className={`text-center text-xs font-medium ${
                  status === "active" ? "text-[#1A1A1A]" : ""
                } ${status === "pending" ? "text-[#999]" : ""} ${
                  status === "completed" ? "text-[#737373]" : ""
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative pt-4">
        <div className="absolute top-0 left-0 h-1 w-full rounded-full bg-[#F5F5F5]" />
        <div
          className="absolute top-0 left-0 h-1 rounded-full bg-amber transition-all duration-500"
          style={{
            width:
              currentPhase === "extraction" ? "0%" : currentPhase === "calibration" ? "50%" : "100%",
          }}
        />
      </div>

      <div className="mt-6 text-center">
        <h3 className="font-bold text-[#1A1A1A]">{PHASE_HEADLINES[currentPhase]}</h3>
        <p className="mt-1 text-sm text-[#737373]">{PHASE_SUBTEXT[currentPhase]}</p>
      </div>
    </div>
  );
};

export default ProgressBar;
