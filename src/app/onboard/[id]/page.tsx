"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ExtractionPhase from "@/components/onboarding/ExtractionPhase";
import CalibrationPhase from "@/components/onboarding/CalibrationPhase";
import IngestionPhase from "@/components/onboarding/IngestionPhase";
import ProgressBar from "@/components/onboarding/ProgressBar";

interface OnboardingSession {
  id: string;
  mentorName: string;
  email: string;
  currentPhase: "extraction" | "calibration" | "ingestion";
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

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

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
      "ingestion"
    ];

    const currentIndex = phaseOrder.indexOf(session.currentPhase);
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      await updateSession({ currentPhase: nextPhase });
    }
  };

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
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
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
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="border-b border-[#E5E2DC] bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Mentor Onboarding</h1>
            <p className="text-sm text-[#999]">
              Welcome, {session.mentorName}! Let's build your mentor agent.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#999]">Session ID: {session.id.substring(0, 8)}...</p>
            <p className="text-xs text-[#999]">
              Expires: {new Date(session.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#E5E2DC] px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <ProgressBar 
            currentPhase={session.currentPhase} 
            onPhaseChange={(phase) => updateSession({ currentPhase: phase })}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          {session.currentPhase === "extraction" && (
            <ExtractionPhase 
              session={session} 
              onUpdate={updateSession}
              onAdvance={advanceToNextPhase}
            />
          )}
          
          {session.currentPhase === "calibration" && (
            <CalibrationPhase 
              session={session} 
              onUpdate={updateSession}
              onAdvance={advanceToNextPhase}
            />
          )}
          
          {session.currentPhase === "ingestion" && (
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
