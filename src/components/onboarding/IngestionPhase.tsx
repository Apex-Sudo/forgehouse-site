import { useState, useEffect, useRef } from "react";
import { IconConfetti, IconRocket } from "@tabler/icons-react";
import type { OnboardingSession } from "@/types/onboarding";

interface IngestionPhaseProps {
  session: OnboardingSession;
  onUpdate: (updates: Partial<OnboardingSession>) => Promise<void>;
  onAdvance: () => void;
}

export default function IngestionPhase({ session, onUpdate }: IngestionPhaseProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">(
    session.currentPhase === "complete" ? "complete" : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const startedRef = useRef(false);

  // Auto-start ingestion when entering this phase (only once)
  useEffect(() => {
    if (session.currentPhase === "ingestion" && !startedRef.current && status === "idle") {
      startedRef.current = true;
      runIngestion();
    }
  }, [session.currentPhase]);

  const runIngestion = async () => {
    setStatus("processing");
    setProgress(0);
    setErrorMessage("");

    try {
      setStatusMessage("Preparing knowledge base...");
      setProgress(5);

      setStatusMessage("Creating mentor record...");
      setProgress(10);
      const mentorRes = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: session.mentorName }),
      });

      if (!mentorRes.ok) {
        const err = await mentorRes.json().catch(() => ({ error: "Failed to create mentor" }));
        throw new Error(err.error);
      }

      setProgress(15);
      setStatusMessage("Synthesizing system prompt and building knowledge base (this may take 1-2 minutes)...");
      setProgress(20);

      const ingestRes = await fetch("/api/onboarding/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          mentorName: session.mentorName,
          extractionData: session.extractionData,
          calibrationData: session.calibrationData,
        }),
      });

      if (!ingestRes.ok) {
        const err = await ingestRes.json().catch(() => ({ error: "Ingestion failed" }));
        throw new Error(err.error);
      }

      const ingestData = await ingestRes.json();

      setProgress(100);
      setStatusMessage("Mentor fully configured and activated!");
      setStatus("complete");

      await onUpdate({
        currentPhase: "complete",
        ingestionData: {
          status: "complete",
          chunksCreated: ingestData.chunksCreated,
          completedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Ingestion error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      setStatusMessage("");
      startedRef.current = false;
    }
  };

  if (status === "complete" || session.currentPhase === "complete") {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-[#FAFAF8] overflow-y-auto">
        <div className="flex-1 min-h-0 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-xl border border-[#E5E2DC] p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6 text-amber">
                <IconConfetti size={36} stroke={1.5} aria-hidden />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Onboarding Complete!</h2>
              <p className="text-[#737373] mb-8">
                Your mentor agent has been created and trained with your expertise.
              </p>
              {session.ingestionData?.chunksCreated && (
                <p className="text-sm text-[#999] mb-6">
                  {session.ingestionData.chunksCreated} knowledge chunks created and embedded.
                </p>
              )}
              <button
                onClick={() => {
                  const slug = session.mentorName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                    .substring(0, 50);
                  window.location.href = `/chat/${slug}`;
                }}
                className="w-full bg-amber text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Chat with your mentor agent →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#FAFAF8] overflow-y-auto">
      <div className="flex-1 min-h-0 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-xl border border-[#E5E2DC] p-8 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6 text-amber">
              <IconRocket size={36} stroke={1.5} aria-hidden />
            </div>

            {status === "idle" && (
              <>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                  Ready to go live
                </h2>
                <p className="text-[#737373] mb-8">
                  We&apos;ll chunk, embed, and store your expertise so your mentor agent can use it in conversations.
                </p>
                <button
                  onClick={runIngestion}
                  className="px-8 py-3 rounded-xl font-semibold transition bg-amber text-white hover:opacity-90"
                >
                  Start launch
                </button>
              </>
            )}

            {status === "processing" && (
              <>
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                  Preparing your launch...
                </h2>
                <p className="text-[#737373] mb-6">{statusMessage}</p>
                <div className="mb-4">
                  <div className="w-full bg-[#F5F5F5] rounded-full h-3 mb-3">
                    <div
                      className="bg-amber h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#999]">{progress}% complete</p>
                </div>
                <button disabled className="px-8 py-3 rounded-xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">
                  Processing...
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Launch failed</h2>
                <p className="text-[#737373] mb-4">{errorMessage}</p>
                <button
                  onClick={runIngestion}
                  className="px-8 py-3 rounded-xl font-semibold transition bg-amber text-white hover:opacity-90"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 py-4 border-t border-[#E5E2DC] bg-white">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={() => onUpdate({ currentPhase: "calibration" })}
            disabled={status === "processing"}
            className="text-[#999] hover:text-[#1A1A1A] border border-[#E5E2DC] px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            ← Back to Calibration
          </button>
        </div>
      </div>
    </div>
  );
}
