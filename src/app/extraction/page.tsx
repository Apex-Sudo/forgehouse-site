"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconCheck, IconCircleCheck, IconClock, IconTool } from "@tabler/icons-react";
import ChatMessage from "@/components/ChatMessage";
import {
  EXTRACTION_EXCHANGE_ESCAPE_HATCH,
  parseExtractionAssistantPayload,
  stripExtractionMetaForDisplay,
} from "@/lib/extraction-meta";
import { readNdjsonStream } from "@/lib/agent/helper/stream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ExtractionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<{ filename: string; content: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [llmMarkedComplete, setLlmMarkedComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load saved extraction session
  useEffect(() => {
    if (status === "authenticated") {
      const saved = localStorage.getItem("fh-extraction-session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed)) {
            setMessages(parsed as Message[]);
          } else if (
            parsed &&
            typeof parsed === "object" &&
            "messages" in parsed &&
            Array.isArray((parsed as { messages: Message[] }).messages)
          ) {
            const { messages: savedMsgs, llmMarkedComplete: savedLlm } = parsed as {
              messages: Message[];
              llmMarkedComplete?: boolean;
            };
            setMessages(savedMsgs);
            setLlmMarkedComplete(Boolean(savedLlm));
          }
        } catch (e) {
          console.error("Failed to parse saved extraction session", e);
        }
      }
    }
  }, [status]);

  // Save on every update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        "fh-extraction-session",
        JSON.stringify({ messages, llmMarkedComplete }),
      );
    }
  }, [messages, llmMarkedComplete]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in?callbackUrl=/extraction");
    }
  }, [status, router]);

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
      
      // Send a message to the assistant about the uploaded CV
      const cvMsg: Message = { 
        role: "user", 
        content: `I've uploaded my CV/resume: ${data.filename}. Please use this information to inform our conversation.` 
      };
      const updated = [...messages, cvMsg];
      setMessages(updated);
      setStreaming(true);

      // Process the CV with the extraction chat API
      try {
        const res = await fetch("/api/extraction-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated, cvContent: data.content }),
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
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/extraction-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updated,
          cvContent: uploadedCV?.content 
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
      : "The guide signaled your expertise is captured well enough to proceed."
    : "You have reached the minimum conversation depth—you can finish here or restart to add more.";

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="mono text-[12px] tracking-[0.04em] text-muted">Loading...</p>
      </div>
    );
  }

  // Show completion screen when extraction is finished
  if (showCompletion) {
    return (
      <div className="flex flex-col h-dvh pt-16 md:pt-[72px] overflow-hidden bg-background">
        {/* Header */}
        <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="mono text-[12px] tracking-[0.06em] text-accent mb-2">Extraction</p>
              <h1 className="text-[26px] leading-none text-foreground">Mentor Extraction Complete</h1>
              <p className="mono text-[11px] tracking-[0.04em] text-faint mt-2">
                {session?.user?.name ? `Session with ${session.user.name}` : "Building your mentor agent"}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Screen */}
        <div className="fh-scroll flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/25 text-accent flex items-center justify-center mx-auto mb-6">
                <IconCircleCheck size={32} stroke={1.5} aria-hidden />
              </div>
              <h2 className="text-[32px] leading-none text-foreground mb-3">Extraction complete</h2>
              <p className="text-muted max-w-md mx-auto mb-8">
                {completionSubtext}
              </p>
              <div className="bg-surface border border-border rounded-lg p-6 mb-8 text-left">
                <ul className="list-disc pl-5 space-y-2 text-foreground/85">
                  <li>Your mentor agent will be trained with this knowledge</li>
                  <li>You'll receive an email notification when your agent is ready</li>
                  <li>You can refine your agent further through additional conversations</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/mentors")}
                  className="mono bg-accent text-[#1B1B18] px-4 py-2 rounded-lg text-[12px] tracking-[0.02em] hover:bg-accent-dim transition"
                >
                  {llmMarkedComplete ? "Continue when ready" : "I have said enough — done"}
                </button>
                <button
                  onClick={() => {
                    setMessages([]);
                    setLlmMarkedComplete(false);
                    localStorage.removeItem("fh-extraction-session");
                  }}
                  className="mono border border-border text-foreground px-4 py-2 rounded-lg text-[12px] tracking-[0.02em] hover:bg-surface-light transition"
                >
                  Restart Extraction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh pt-16 md:pt-[72px] overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="mono text-[12px] tracking-[0.06em] text-accent mb-2">Extraction</p>
            <h1 className="text-[26px] leading-none text-foreground">Mentor Extraction</h1>
            <p className="mono text-[11px] tracking-[0.04em] text-faint mt-2">
              {session?.user?.name ? `Session with ${session.user.name}` : "Building your mentor agent"}
              {exchangeCount > 0 && ` · ${exchangeCount} exchanges`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded bg-white/8 text-muted border border-border">
              {exchangeCount < 10
                ? "Phase 1: Foundation"
                : exchangeCount < 20
                ? "Phase 2: Frameworks"
                : exchangeCount < 30
                ? "Phase 3: Patterns"
                : exchangeCount < EXTRACTION_EXCHANGE_ESCAPE_HATCH
                ? "Phase 4: Pressure testing"
                : "Depth target met"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="fh-scroll flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/25 text-accent flex items-center justify-center mx-auto mb-6">
                <IconTool size={30} stroke={1.5} aria-hidden />
              </div>
              <h2 className="text-[32px] leading-none text-foreground mb-6">Ready to extract your expertise</h2>

              {/* Time estimate */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <IconClock size={20} stroke={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <p className="text-muted text-sm text-left">
                    <span className="mono text-[11px] uppercase tracking-[0.06em] text-foreground">Time estimate:</span> 1-2 hours to complete thoroughly.
                    You can pause and return anytime - your progress is automatically saved.
                  </p>
                </div>
              </div>

              {/* CV Upload */}
              <div className="mb-8 max-w-md mx-auto">
                <div className="border-2 border-dashed border-border bg-surface rounded-lg p-6 transition hover:border-accent/40 hover:bg-surface-light">
                  <h3 className="text-[19px] leading-tight text-foreground mb-2">Speed up with your CV/Resume</h3>
                  <p className="text-muted text-sm mb-4">
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
                    className="mono w-full py-2 rounded-lg border border-border text-foreground text-[12px] tracking-[0.02em] transition hover:bg-surface-light disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload CV/Resume"}
                  </button>

                  {uploadedCV && (
                    <div className="mono mt-3 text-[11px] text-accent flex items-center justify-center gap-1.5">
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
              <button
                onClick={() =>
                  sendMessage("Let's get started.")
                }
                className="mono bg-accent text-[#1B1B18] px-4 py-2 rounded-lg text-[12px] tracking-[0.02em] hover:bg-accent-dim transition"
              >
                Start Extraction →
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Progress Bar */}
      {messages.length > 0 && (
        <div className="shrink-0 px-6 py-2 bg-surface border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="mono flex justify-between text-[11px] uppercase tracking-[0.06em] text-faint mb-1">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((exchangeCount / EXTRACTION_EXCHANGE_ESCAPE_HATCH) * 100))}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (exchangeCount / EXTRACTION_EXCHANGE_ESCAPE_HATCH) * 100)}%` }}
              ></div>
            </div>
            <div className="mono text-[11px] tracking-[0.02em] text-faint mt-1">
              {exchangeCount} of ~{EXTRACTION_EXCHANGE_ESCAPE_HATCH} exchanges (finish earlier if the guide marks you ready)
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {messages.length > 0 && (
        <div className="shrink-0 border-t border-border bg-surface px-6 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thinking..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-faint transition focus:outline-none focus:border-accent/60 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="mono self-end bg-accent text-[#1B1B18] px-4 py-2 rounded-lg text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {streaming ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
