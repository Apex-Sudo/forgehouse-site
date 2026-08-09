"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconAlertCircle } from "@tabler/icons-react";
import ExtractionPhase from "@/components/onboarding/ExtractionPhase";
import CalibrationPhase from "@/components/onboarding/CalibrationPhase";
import IngestionPhase from "@/components/onboarding/IngestionPhase";
import ProgressBar from "@/components/onboarding/ProgressBar";
import ProgramDashboard from "@/components/onboarding/ProgramDashboard";
import { formatExpiryOrdinal } from "@/lib/format-expiry";
import type { OnboardingSession } from "@/types/onboarding";

/** "colin chapman" → "Colin Chapman". Tolerates a missing or partial name. */
function titleCase(name: string | undefined | null): string {
  return (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributionLive, setContributionLive] = useState(false);
  const [stepperUserExpanded, setStepperUserExpanded] = useState(false);
  const contributionCommencePendingRef = useRef(false);

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  useEffect(() => {
    if (!session) return;
    if (session.currentPhase !== "extraction") {
      contributionCommencePendingRef.current = false;
      setContributionLive(false);
      setStepperUserExpanded(false);
      return;
    }
    const n = session.extractionData?.messages?.length ?? 0;
    if (n > 0) {
      contributionCommencePendingRef.current = false;
      setContributionLive(true);
      return;
    }
    if (contributionCommencePendingRef.current) {
      return;
    }
    setContributionLive(false);
  }, [session?.currentPhase, session?.extractionData?.messages?.length]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/onboarding/${id}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch session data");
      }

      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Error fetching session:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (updates: Partial<OnboardingSession>) => {
    try {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update session");
      }

      const updatedData = await res.json();
      setSession(updatedData);
      return updatedData;
    } catch (err) {
      console.error("Error updating session:", err);
      throw err;
    }
  };

  const advanceToNextPhase = async () => {
    if (!session) return;

    const phaseOrder: Array<"extraction" | "calibration" | "ingestion"> = [
      "extraction",
      "calibration",
      "ingestion",
    ];

    const phaseKey =
      session.currentPhase === "complete" ? "ingestion" : session.currentPhase;
    const currentIndex = phaseOrder.indexOf(phaseKey);
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      await updateSession({ currentPhase: nextPhase });
    }
  };

  const phaseForBar =
    session && (session.currentPhase === "complete" ? "ingestion" : session.currentPhase);
  const showCompactStepper =
    session?.currentPhase === "extraction" &&
    contributionLive &&
    !stepperUserExpanded;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-5"></div>
          <p className="mono text-[12px] tracking-[0.04em] text-muted">
            Loading your onboarding session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-6">
        <div className="text-center max-w-md p-8 bg-surface border border-border rounded-lg">
          <div className="w-16 h-16 rounded-full bg-[#F2777A]/12 border border-[#F2777A]/25 flex items-center justify-center mx-auto mb-5 text-[#F2777A]">
            <IconAlertCircle size={32} stroke={1.5} aria-hidden />
          </div>
          <h2 className="text-[28px] text-foreground mb-3">Session Error</h2>
          <p className="text-muted text-[15px] leading-relaxed mb-7">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mono cursor-pointer bg-transparent text-accent border border-accent/70 px-6 py-2.5 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-6">
        <div className="text-center">
          <h2 className="text-[28px] text-foreground mb-3">Session Not Found</h2>
          <p className="mono text-[12px] tracking-[0.04em] text-muted">
            The onboarding session could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Sessions created before Extraction 2.0 keep the legacy three-phase flow;
  // anything invited since runs the module program.
  if ((session.programVersion ?? 1) >= 2) {
    return (
      <div className="flex flex-col h-dvh pt-16 overflow-hidden bg-background">
        <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
          <div className="max-w-[900px] mx-auto flex items-start justify-between gap-4">
            <div>
              <p className="mono text-[11px] uppercase tracking-[0.08em] text-accent mb-2">
                Onboarding
              </p>
              <h1 className="text-[26px] leading-none text-foreground">
                {titleCase(session.mentorName)
                  ? `Welcome, ${titleCase(session.mentorName)}!`
                  : "Welcome!"}
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="mono text-[11px] tracking-[0.04em] text-faint">
                Expires: {formatExpiryOrdinal(session.expiresAt)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ProgramDashboard onboardingId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh pt-16 overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.08em] text-accent mb-2">Onboarding</p>
            <h1 className="text-[26px] leading-none text-foreground">
              {titleCase(session.mentorName)
                ? `Welcome, ${titleCase(session.mentorName)}!`
                : "Welcome!"}
            </h1>
            <h3 className="mono text-[12px] tracking-[0.02em] text-muted mt-2">Let&apos;s get your expertise live.</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="mono text-[11px] tracking-[0.04em] text-faint">
              Expires: {formatExpiryOrdinal(session.expiresAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-surface border-b border-border px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <ProgressBar
            currentPhase={phaseForBar as "extraction" | "calibration" | "ingestion"}
            onPhaseChange={(phase) => updateSession({ currentPhase: phase })}
            variant={showCompactStepper ? "compact" : "full"}
            onExpand={
              showCompactStepper ? () => setStepperUserExpanded(true) : undefined
            }
            onCollapse={
              session.currentPhase === "extraction" &&
              contributionLive &&
              stepperUserExpanded
                ? () => setStepperUserExpanded(false)
                : undefined
            }
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-6 pb-2 pt-2">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
          {session.currentPhase === "extraction" && (
            <ExtractionPhase
              session={session}
              onUpdate={updateSession}
              onAdvance={advanceToNextPhase}
              onContributionCommenced={() => {
                contributionCommencePendingRef.current = true;
                setContributionLive(true);
              }}
              onContributionRestart={() => {
                contributionCommencePendingRef.current = false;
                setContributionLive(false);
                setStepperUserExpanded(false);
              }}
            />
          )}

          {session.currentPhase === "calibration" && (
            <CalibrationPhase
              session={session}
              onUpdate={updateSession}
              onAdvance={advanceToNextPhase}
            />
          )}

          {(session.currentPhase === "ingestion" || session.currentPhase === "complete") && (
            <IngestionPhase
              session={session}
              onUpdate={updateSession}
              onAdvance={advanceToNextPhase}
            />
          )}
        </div>
      </div>
    </div>
  );
}
