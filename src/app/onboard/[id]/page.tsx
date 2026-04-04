"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconAlertCircle } from "@tabler/icons-react";
import ExtractionPhase from "@/components/onboarding/ExtractionPhase";
import CalibrationPhase from "@/components/onboarding/CalibrationPhase";
import IngestionPhase from "@/components/onboarding/IngestionPhase";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { formatExpiryOrdinal } from "@/lib/format-expiry";

interface OnboardingSession {
  id: string;
  mentorName: string;
  email: string;
  currentPhase: "extraction" | "calibration" | "ingestion" | "complete";
  extractionData: any;
  calibrationData: any;
  ingestionData: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
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
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-[#737373]">Loading your onboarding session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
            <IconAlertCircle size={36} stroke={1.5} aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Session Error</h2>
          <p className="text-[#737373] mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Session Not Found</h2>
          <p className="text-[#737373]">The onboarding session could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh pt-16 overflow-hidden bg-[#FAFAF8]">
      <div className="shrink-0 border-b border-[#E5E2DC] bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Welcome, {session.mentorName.split(' ')[0]?.[0]?.toUpperCase() + session.mentorName.split(' ')[0]?.slice(1) + ' ' + session.mentorName.split(' ')[1]?.[0]?.toUpperCase() + session.mentorName.split(' ')[1]?.slice(1) + '!'}</h1>
            <h3 className="text-[#999]">Let&apos;s get your expertise live.</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#999]">
              Expires: {formatExpiryOrdinal(session.expiresAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-b border-[#E5E2DC] px-6 py-3">
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
