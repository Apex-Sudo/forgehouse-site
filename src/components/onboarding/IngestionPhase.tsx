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
      <div className="fh-scroll flex flex-col flex-1 min-h-0 overflow-y-auto rounded-lg border border-border bg-surface">
        <div className="flex-1 min-h-0 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-background rounded-lg border border-border p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-6 text-accent">
                <IconConfetti size={32} stroke={1.5} aria-hidden />
              </div>
              <p className="mono text-[11px] uppercase tracking-[0.08em] text-accent mb-3">Launch</p>
              <h2 className="text-[32px] leading-none text-foreground mb-3">Onboarding Complete!</h2>
              <p className="text-muted mb-8">
                Your mentor agent has been created and trained with your expertise.
              </p>
              {session.ingestionData?.chunksCreated && (
                <p className="mono text-[11px] tracking-[0.02em] text-faint mb-6">
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
                className="mono w-full bg-accent text-[#1B1B18] px-4 py-2.5 rounded-lg text-[12px] tracking-[0.02em] hover:bg-accent-dim transition"
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
    <div className="fh-scroll flex flex-col flex-1 min-h-0 overflow-y-auto rounded-lg border border-border bg-surface">
      <div className="flex-1 min-h-0 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-background rounded-lg border border-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#E3B341]/12 border border-[#E3B341]/25 flex items-center justify-center mx-auto mb-6 text-[#E3B341]">
              <IconRocket size={32} stroke={1.5} aria-hidden />
            </div>

            {status === "idle" && (
              <>
                <p className="mono text-[11px] uppercase tracking-[0.08em] text-[#E3B341] mb-3">Launch</p>
                <h2 className="text-[32px] leading-none text-foreground mb-3">
                  Ready to go live
                </h2>
                <p className="text-muted mb-8">
                  We&apos;ll chunk, embed, and store your expertise so your mentor agent can use it in conversations.
                </p>
                <button
                  onClick={runIngestion}
                  className="mono px-4 py-2.5 rounded-lg text-[12px] tracking-[0.02em] transition bg-accent text-[#1B1B18] hover:bg-accent-dim"
                >
                  Start launch
                </button>
              </>
            )}

            {status === "processing" && (
              <>
                <p className="mono text-[11px] uppercase tracking-[0.08em] text-[#E3B341] mb-3">Launch</p>
                <h2 className="text-[32px] leading-none text-foreground mb-3">
                  Preparing your launch...
                </h2>
                <p className="text-muted mb-6">{statusMessage}</p>
                <div className="mb-6">
                  <div className="w-full bg-white/10 rounded-full h-3 mb-3">
                    <div
                      className="bg-accent h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mono text-[11px] tracking-[0.02em] text-faint">{progress}% complete</p>
                </div>
                <button disabled className="mono px-4 py-2.5 rounded-lg text-[12px] tracking-[0.02em] border border-border text-faint opacity-40 cursor-not-allowed">
                  Processing...
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <p className="mono text-[11px] uppercase tracking-[0.08em] text-[#F2777A] mb-3">Launch</p>
                <h2 className="text-[32px] leading-none text-[#F2777A] mb-3">Launch failed</h2>
                <p className="mono text-[12px] leading-relaxed rounded-lg border border-[#F2777A]/25 bg-[#F2777A]/12 text-[#F2777A] px-4 py-3 mb-6">{errorMessage}</p>
                <button
                  onClick={runIngestion}
                  className="mono px-4 py-2.5 rounded-lg text-[12px] tracking-[0.02em] transition bg-accent text-[#1B1B18] hover:bg-accent-dim"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 py-4 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={() => onUpdate({ currentPhase: "calibration" })}
            disabled={status === "processing"}
            className="mono text-[12px] tracking-[0.02em] text-muted border border-border px-4 py-2 rounded-lg transition hover:text-foreground hover:bg-surface-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back to Calibration
          </button>
        </div>
      </div>
    </div>
  );
}
