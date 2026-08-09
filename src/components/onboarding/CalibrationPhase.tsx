"use client";

import { useState, useRef, useEffect } from "react";
import { IconTarget } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import ClipButton from "@/components/ui/ClipButton";
import { readNdjsonStream } from "@/lib/agent/helper/stream";
import type { OnboardingSession } from "@/types/onboarding";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CalibrationPhaseProps {
  session: OnboardingSession;
  onUpdate: (updates: Partial<OnboardingSession>) => Promise<void>;
  onAdvance: () => void;
}

export default function CalibrationPhase({ session, onUpdate, onAdvance }: CalibrationPhaseProps) {
  const [messages, setMessages] = useState<Message[]>(session.calibrationData?.messages || []);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(messages.length > 0);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, streaming]);

  // Save progress to session
  useEffect(() => {
    const saveProgress = async () => {
      if (messages.length > 0) {
        await onUpdate({
          calibrationData: {
            messages,
            updatedAt: new Date().toISOString()
          }
        });
      }
    };
    
    // Debounce the save to avoid too many requests
    const timer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timer);
  }, [messages, onUpdate]);

  const getExtractionContext = (): string | undefined => {
    if (session.extractionData?.messages) {
      const msgs = session.extractionData.messages as Message[];
      return msgs
        .map((m) => `[${m.role}]: ${m.content}`)
        .join("\n\n")
        .slice(0, 8000);
    }
    return undefined;
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);
    setStarted(true);

    try {
      const res = await fetch("/api/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "assistant", content: "Let's build your coaching style!\n\nThis first step will take ~1.5-2 hours. You can pause anytime.\n[INFOGRAPHIC PLACEHOLDER]\n\n1. Start with your CV upload\n2. Answer key domain questions\n3. Review system prompts for tone" },
            ...updated
          ],
          mentorSlug: session.id,
          extractionContext: getExtractionContext(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: err.error || "Something went wrong." },
        ]);
        setStreaming(false);
        return;
      }

      if (!res.body) return;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      await readNdjsonStream(res.body, (accumulated) => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const exportCorrections = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calibration-${session.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const corrections = messages.filter((m) => m.role === "user").length;
  const phases = corrections < 5 ? "Voice" : corrections < 15 ? "Frameworks" : corrections < 20 ? "Edge Cases" : "Final";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden rounded-lg border border-border bg-surface">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-light border border-border text-accent">
            <IconTarget size={18} stroke={1.5} aria-hidden />
          </span>
          <div>
            <h1 className="text-[20px] leading-none text-foreground">Calibration Session</h1>
            <p className="mono text-[11px] uppercase tracking-[0.06em] text-faint mt-1.5">{session.mentorName} · Phase: {phases}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Start over? This will clear the conversation.")) {
                  setMessages([]);
                  setStarted(false);
                  onUpdate({
                    calibrationData: {
                      messages: [],
                      updatedAt: new Date().toISOString()
                    }
                  });
                }
              }}
              className="mono cursor-pointer text-[11px] uppercase tracking-[0.08em] text-muted border border-border px-3 py-1.5 rounded-md transition hover:text-[#F2777A] hover:border-[#F2777A]/25 hover:bg-[#F2777A]/10"
            >
              Reset
            </button>
            <button
              onClick={exportCorrections}
              className="mono cursor-pointer text-[11px] uppercase tracking-[0.08em] text-muted border border-border px-3 py-1.5 rounded-md transition hover:text-foreground hover:bg-surface-light"
            >
              Export
            </button>
          </div>
        )}
      </div>

      <div
        ref={messagesScrollRef}
        className="fh-scroll min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 py-4 [overflow-anchor:none]"
      >
        {!started && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed bg-accent text-[#1B1B18] rounded-lg rounded-bl-sm">
              Welcome back! Your agent is built and ready for you to put it through its paces. I&apos;m going to show you how it handles different situations, and you tell me where it nails it and where it&apos;s off. Think of it like training a new team member who&apos;s read all your playbooks but hasn&apos;t sat in the room with you yet. Let&apos;s start with something simple.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "user" ? (
              <div className="max-w-[75%] px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-right border border-border text-foreground rounded-lg rounded-br-sm">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed bg-accent text-[#1B1B18] rounded-lg rounded-bl-sm empty:hidden">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="text-[#1B1B18]">{children}</strong>,
                    em: ({ children }) => <em className="italic text-[#1B1B18]/80">{children}</em>,
                    ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 list-none">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <span className="text-[#1B1B18]/55 mt-0.5 shrink-0">▸</span>
                        <span>{children}</span>
                      </li>
                    ),
                    code: ({ children }) => (
                      <code className="bg-[#1B1B18]/10 text-[#1B1B18] px-1.5 py-0.5 rounded text-[13px] mono">{children}</code>
                    ),
                    h1: ({ children }) => <h3 className="text-[#1B1B18] mb-2 text-[19px]">{children}</h3>,
                    h2: ({ children }) => <h3 className="text-[#1B1B18] mb-2 text-[19px]">{children}</h3>,
                    h3: ({ children }) => <h3 className="text-[#1B1B18] mb-1.5 text-[17px]">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-[#1B1B18]/30 pl-3 my-2 text-[#1B1B18]/70 italic">{children}</blockquote>
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {streaming &&
          messages.length > 0 &&
          messages[messages.length - 1].content === "" && (
            <div className="flex justify-start items-center gap-3">
              <span className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:200ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:400ms]" />
              </span>
            </div>
          )}

      </div>

      <div
        className="shrink-0 border-t border-border bg-surface py-3"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-4xl space-y-3 px-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {["Voice", "Frameworks", "Final"].map((p) => (
                <div
                  key={p}
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                    phases === p ? "bg-accent" : corrections > ["Voice", "Frameworks", "Final"].indexOf(p) ? "bg-accent/40" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="mono text-[11px] uppercase tracking-[0.06em] text-faint">{phases} phase</span>
          </div>

          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what's right and what's off..."
              rows={1}
              className="fh-scroll max-h-[200px] flex-1 resize-none overflow-y-auto rounded-md border border-border bg-background px-5 py-3.5 text-[15px] text-foreground transition placeholder:text-faint focus:border-accent/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={streaming}
              className="mono shrink-0 self-end bg-transparent text-accent border border-accent/70 px-7 py-3 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => onUpdate({ currentPhase: "extraction" })}
              className="mono cursor-pointer rounded-md border border-border px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] text-muted transition hover:text-foreground hover:bg-surface-light"
            >
              ← Back to Contribution
            </button>
            <div className="w-[240px] shrink-0">
              <ClipButton variant="accent" onClick={onAdvance}>
                Finish and Submit
              </ClipButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
