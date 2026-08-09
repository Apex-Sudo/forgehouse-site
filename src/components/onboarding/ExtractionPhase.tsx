"use client";

import { useState, useRef, useEffect } from "react";
import { IconCheck, IconClock, IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import ChatMessage from "@/components/ChatMessage";
import ClipButton from "@/components/ui/ClipButton";
import {
  EXTRACTION_EXCHANGE_ESCAPE_HATCH,
  parseExtractionAssistantPayload,
  stripExtractionMetaForDisplay,
} from "@/lib/extraction-meta";
import { readNdjsonStream } from "@/lib/agent/helper/stream";
import type { OnboardingSession } from "@/types/onboarding";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExtractionPhaseProps {
  session: OnboardingSession;
  onUpdate: (updates: Partial<OnboardingSession>) => Promise<void>;
  onAdvance: () => void;
  onContributionCommenced?: () => void;
  onContributionRestart?: () => void;
}

export default function ExtractionPhase({
  session,
  onUpdate,
  onAdvance,
  onContributionCommenced,
  onContributionRestart,
}: ExtractionPhaseProps) {
  const [messages, setMessages] = useState<Message[]>(session.extractionData?.messages || []);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<{ filename: string; content: string } | null>(session.extractionData?.cv || null);
  const [isUploading, setIsUploading] = useState(false);
  const [llmMarkedComplete, setLlmMarkedComplete] = useState(
    Boolean(session.extractionData?.llmMarkedComplete),
  );
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, streaming]);

  // Check for SpeechRecognition support and initialize
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        // Append to current input value
        setInput((prev) => {
          const hasSpace = prev.length > 0 && !prev.endsWith(" ");
          return prev + (hasSpace ? " " : "") + transcript;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        // Handle specific error cases
        if (event.error === "not-allowed") {
          alert("Microphone access denied. Please grant microphone permissions in your browser settings to use voice dictation.");
        } else if (event.error === "not-allowed" && !window.location.protocol.includes("https")) {
          alert("Microphone access requires HTTPS. Please ensure you're accessing this site over a secure connection.");
        }
        stopListening();
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };
    } else {
      setSpeechRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || !speechRecognitionSupported || streaming) return;

    // Check if we're on HTTPS (required for microphone access)
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      alert("Voice dictation requires a secure connection (HTTPS). Please ensure you're accessing this site over HTTPS.");
      return;
    }

    try {
      // Clear any previous input when starting fresh
      setInput("");
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      // Handle the case where recognition is already started
      if (error instanceof DOMException && error.name === "InvalidStateError") {
        // Recognition is already running, stop it first
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Failed to stop speech recognition:", error);
    }

    isListeningRef.current = false;
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Save progress to session (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      if (messages.length > 0 || uploadedCV) {
        await onUpdate({
          extractionData: {
            messages,
            cv: uploadedCV,
            llmMarkedComplete,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    };
    
    // Debounce the save to avoid too many requests
    const timer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timer);
  }, [messages, uploadedCV, llmMarkedComplete, onUpdate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        alert(err.error || "Failed to upload CV");
        return;
      }

      const data = await res.json();
      setUploadedCV(data);
      
      // Immediately save the CV data to the session
      await onUpdate({
        extractionData: {
          messages,
          cv: data,
          llmMarkedComplete,
          updatedAt: new Date().toISOString(),
        },
      });
      
      // Send a message to the assistant about the uploaded CV
      const cvMsg: Message = { 
        role: "user", 
        content: `I've uploaded my CV/resume: ${data.filename}. Please use this information to inform our conversation.` 
      };
      const updated = [...messages, cvMsg];
      if (messages.length === 0) {
        onContributionCommenced?.();
      }
      setMessages(updated);
      setStreaming(true);

      // Process the CV with the extraction chat API
      try {
        const res = await fetch("/api/extraction-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated,
            cvContent: data.content,
            onboardingSessionId: session.id,
          }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          setMessages([...updated, { role: "assistant", content: `Error: ${err.error || "Something went wrong."}` }]);
          setStreaming(false);
          return;
        }

        setMessages([...updated, { role: "assistant", content: "" }]);

        const assistantContent = await readNdjsonStream(res.body, (accumulated) => {
          const visible = stripExtractionMetaForDisplay(accumulated);
          setMessages([...updated, { role: "assistant", content: visible }]);
        });
        const parsed = parseExtractionAssistantPayload(assistantContent);
        setMessages([...updated, { role: "assistant", content: parsed.display }]);
        if (parsed.complete) {
          setLlmMarkedComplete(true);
        }
      } catch {
        setMessages([...updated, { role: "assistant", content: "Error: Connection failed. Please try again." }]);
      } finally {
        setStreaming(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload CV");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    if (messages.length === 0) {
      onContributionCommenced?.();
    }
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/extraction-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          cvContent: uploadedCV?.content,
          onboardingSessionId: session.id,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessages([...updated, { role: "assistant", content: `Error: ${err.error || "Something went wrong."}` }]);
        setStreaming(false);
        return;
      }

      setMessages([...updated, { role: "assistant", content: "" }]);

      const assistantContent = await readNdjsonStream(res.body, (accumulated) => {
        const visible = stripExtractionMetaForDisplay(accumulated);
        setMessages([...updated, { role: "assistant", content: visible }]);
      });
      const parsed = parseExtractionAssistantPayload(assistantContent);
      setMessages([...updated, { role: "assistant", content: parsed.display }]);
      if (parsed.complete) {
        setLlmMarkedComplete(true);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Error: Connection failed. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const exchangeCount = messages.filter((m) => m.role === "user").length;
  const hitExchangeEscapeHatch =
    exchangeCount >= EXTRACTION_EXCHANGE_ESCAPE_HATCH && !streaming;
  const showCompletion = llmMarkedComplete || hitExchangeEscapeHatch;

  const completionSubtext = llmMarkedComplete
    ? hitExchangeEscapeHatch
      ? "The guide signaled you are ready, and you have also reached the depth where you can move on whenever you like."
      : "The guide signaled you have enough captured to move on to calibration."
    : "You have reached the minimum conversation depth—you can move on to calibration anytime, or restart if you want to capture more first.";

  if (showCompletion) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-lg border border-border bg-surface">
        {/* Completion Screen */}
        <div className="fh-scroll flex-1 min-h-0 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <p className="mono text-[11px] uppercase tracking-[0.08em] text-accent mb-3">Contribution</p>
              <h2 className="text-[32px] leading-none text-foreground mb-3">Ready for calibration</h2>
              <p className="text-muted max-w-md mx-auto mb-4">
                {completionSubtext}
              </p>
              <p className="mono text-[12px] leading-relaxed text-faint max-w-md mx-auto mb-8">
                Next you&apos;ll refine how your agent communicates in calibration.
              </p>
              <div className="rounded-md border border-border bg-background p-6 mb-8 text-left">
                <h3 className="mono text-[11px] uppercase tracking-[0.06em] text-accent mb-3">What happens next:</h3>
                <ul className="space-y-2 text-foreground/85">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-accent">▸</span>
                    <span>Your mentor agent will be trained with this knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-accent">▸</span>
                    <span>You will now refine your agent further through additional conversations</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="w-full sm:w-[280px]">
                  <ClipButton variant="accent" onClick={onAdvance}>
                    {llmMarkedComplete
                      ? "Continue when ready"
                      : "I’ve said enough — next step"}
                  </ClipButton>
                </div>
                <button
                  onClick={() => {
                    setMessages([]);
                    setLlmMarkedComplete(false);
                    void onUpdate({
                      extractionData: {
                        messages: [],
                        cv: uploadedCV,
                        llmMarkedComplete: false,
                        updatedAt: new Date().toISOString(),
                      },
                    });
                    onContributionRestart?.();
                  }}
                  className="mono cursor-pointer border border-border text-muted px-6 py-3 rounded-md text-[11px] uppercase tracking-[0.08em] hover:text-foreground hover:bg-surface-light transition"
                >
                  Restart contribution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showComposer = !showCompletion && messages.length > 0;

  const progressDenominator = EXTRACTION_EXCHANGE_ESCAPE_HATCH;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden rounded-lg border border-border bg-surface">
      <div
        ref={messagesScrollRef}
        className="fh-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 py-4 [overflow-anchor:none]"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center">
              {/* Time estimate */}
              <div className="rounded-md bg-accent/5 p-4 mb-6 max-w-md mx-auto border border-accent/20">
                <div className="flex items-start gap-3">
                  <IconClock size={22} stroke={1.75} className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-muted text-[15px] leading-relaxed text-left">
                    <span className="mono text-[11px] uppercase tracking-[0.06em] text-foreground">Time estimate:</span> 1-2 hours to complete thoroughly. Your progress is automatically saved.
                  </p>
                </div>
              </div>

              {/* CV Upload */}
              <div className="mb-8 max-w-md mx-auto">
                <div className="rounded-md border border-dashed border-border bg-background p-6 transition hover:border-accent/40 hover:bg-surface-light">
                  <h3 className="text-[19px] leading-tight text-foreground mb-2">Speed up with your CV/Resume</h3>
                  <p className="text-muted text-[15px] leading-relaxed mb-4">
                    Upload your CV to skip surface-level questions and dive straight into your expertise.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    disabled={isUploading}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mono w-full cursor-pointer py-2.5 rounded-md border border-border text-muted text-[11px] uppercase tracking-[0.08em] transition hover:text-foreground hover:bg-surface-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload CV/Resume"}
                  </button>

                  {uploadedCV && (
                    <div className="mono mt-3 flex items-center justify-center gap-1.5 text-[11px] text-accent">
                      <IconCheck size={14} stroke={2} aria-hidden />
                      <span>Uploaded: {uploadedCV.filename}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-muted max-w-md mx-auto mb-8">
                This conversation will map how you think, diagnose problems, and help people.
                No prep needed. Just talk naturally.
              </p>
              <div className="mx-auto w-full max-w-[280px]">
                <ClipButton
                  variant="accent"
                  onClick={() => sendMessage("Let's get started.")}
                >
                  Start contribution
                </ClipButton>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
      </div>

      {showComposer && (
        <div
          className="shrink-0 border-t border-border bg-surface py-3"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl space-y-3 px-6">
            <div>
              <div className="mono mb-1 flex justify-between text-[11px] uppercase tracking-[0.06em] text-faint">
                <span>Progress</span>
                <span>{Math.min(100, Math.round((exchangeCount / progressDenominator) * 100))}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border">
                <div
                  className="h-2 rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, (exchangeCount / progressDenominator) * 100)}%` }}
                />
              </div>
              <div className="mono mt-1 text-[11px] tracking-[0.02em] text-faint">
                {exchangeCount} of ~{progressDenominator} exchanges (you can finish earlier if the guide says you&apos;re ready)
              </div>
            </div>

            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thinking..."
                rows={2}
                className="flex-1 resize-none rounded-md border border-border bg-background px-5 py-3.5 text-[15px] text-foreground placeholder:text-faint transition focus:border-accent/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={streaming}
              />
              <div className="flex gap-2 self-end">
                {speechRecognitionSupported ? (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={streaming}
                    className={`mono self-end cursor-pointer rounded-md px-3 py-3 transition ${
                      isListening
                        ? "border border-[#F2777A]/25 bg-[#F2777A]/12 text-[#F2777A] hover:bg-[#F2777A]/20 animate-pulse"
                        : "border border-border text-muted hover:text-foreground hover:bg-surface-light"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={isListening ? "Stop listening" : "Start voice dictation"}
                  >
                    {isListening ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mono self-end rounded-md border border-border px-3 py-3 text-faint opacity-40 cursor-not-allowed"
                    title="Voice dictation not supported in this browser. Try Chrome, Safari, or Edge."
                  >
                    <IconMicrophone size={20} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
                  className="mono shrink-0 self-end bg-transparent text-accent border border-accent/70 px-7 py-3 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {streaming ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
