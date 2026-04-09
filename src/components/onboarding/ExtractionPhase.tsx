"use client";

import { useState, useRef, useEffect } from "react";
import { IconCheck, IconClock } from "@tabler/icons-react";
import ChatMessage from "@/components/ChatMessage";
import {
  EXTRACTION_EXCHANGE_ESCAPE_HATCH,
  parseExtractionAssistantPayload,
  stripExtractionMetaForDisplay,
} from "@/lib/extraction-meta";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, streaming]);

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

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages([...updated, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          const visible = stripExtractionMetaForDisplay(assistantContent);
          setMessages([...updated, { role: "assistant", content: visible }]);
        }
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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...updated, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const visible = stripExtractionMetaForDisplay(assistantContent);
        setMessages([...updated, { role: "assistant", content: visible }]);
      }
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
      <div className="flex flex-col flex-1 min-h-0 bg-[#FAFAF8]">
        {/* Completion Screen */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Ready for calibration</h2>
              <p className="text-[#737373] max-w-md mx-auto mb-4">
                {completionSubtext}
              </p>
              <p className="text-[#737373] max-w-md mx-auto mb-8 text-sm">
                Next you&apos;ll refine how your agent communicates in calibration.
              </p>
              <div className="bg-amber/10 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-bold text-[#1A1A1A] mb-2">What happens next:</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#737373]">
                  <li>Your mentor agent will be trained with this knowledge</li>
                  <li>You will now refine your agent further through additional conversations</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onAdvance}
                  className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                >
                  {llmMarkedComplete
                    ? "Continue when ready →"
                    : "I’ve said enough — next step →"}
                </button>
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
                  className="border border-[#E5E2DC] text-[#1A1A1A] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#F5F5F5] transition"
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
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[#FAFAF8]">
      <div
        ref={messagesScrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 py-4 [overflow-anchor:none]"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center">
              {/* Time estimate */}
              <div className="rounded-xl bg-amber/5 p-4 mb-6 max-w-md mx-auto border border-amber/15">
                <div className="flex items-start gap-3">
                  <IconClock size={22} stroke={1.75} className="mt-0.5 shrink-0 text-amber" />
                  <p className="text-[#737373] text-sm text-left">
                    <span className="font-semibold text-[#1A1A1A]">Time estimate:</span> 1-2 hours to complete thoroughly. Your progress is automatically saved.
                  </p>
                </div>
              </div>
              
              {/* CV Upload */}
              <div className="mb-8 max-w-md mx-auto">
                <div className="border-2 border-dashed border-[#E5E2DC] rounded-xl p-6">
                  <h3 className="font-bold text-[#1A1A1A] mb-2">Speed up with your CV/Resume</h3>
                  <p className="text-[#737373] text-sm mb-4">
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
                    className={`w-full py-2 rounded-lg text-sm font-medium ${
                      isUploading 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E2DC]"
                    }`}
                  >
                    {isUploading ? "Uploading..." : "Upload CV/Resume"}
                  </button>
                  
                  {uploadedCV && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber">
                      <IconCheck size={16} stroke={2} aria-hidden />
                      <span>Uploaded: {uploadedCV.filename}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-[#737373] max-w-md mx-auto mb-8">
                This conversation will map how you think, diagnose problems, and help people.
                No prep needed. Just talk naturally.
              </p>
              <button
                onClick={() =>
                  sendMessage("Let's get started.")
                }
                className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                Start contribution →
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
      </div>

      {showComposer && (
        <div
          className="shrink-0 border-t border-[#E5E2DC] bg-white py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl space-y-3 px-6">
            <div>
              <div className="mb-1 flex justify-between text-xs text-[#999]">
                <span>Progress</span>
                <span>{Math.min(100, Math.round((exchangeCount / progressDenominator) * 100))}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F5F5F5]">
                <div
                  className="h-2 rounded-full bg-amber transition-all duration-300"
                  style={{ width: `${Math.min(100, (exchangeCount / progressDenominator) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-[#999]">
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
                className="flex-1 resize-none rounded-xl border border-[#E5E2DC] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#C5C0B8] focus:border-amber/50 focus:outline-none"
                disabled={streaming}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="self-end rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {streaming ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
