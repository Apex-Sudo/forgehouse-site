"use client";
import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { IconTool, IconPaperclip } from "@tabler/icons-react";

const CONTRIBUTE_ACCESS_CODE = "HYNXmhPKruI";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ExtractionPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="mono text-[12px] tracking-[0.04em] text-muted">Loading...</span></div>}>
      <ExtractionPage />
    </Suspense>
  );
}

function ExtractionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load saved conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`fh-contribute-${slug}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      setMessages(parsed);
      setStarted(true);
    }
  }, [slug]);

  // Save conversation to localStorage on every update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`fh-contribute-${slug}`, JSON.stringify(messages));
    }
  }, [messages, slug]);

  // Auto-save to Telegram every 5 exchanges and track last saved count
  const lastSavedRef = useRef(0);
  useEffect(() => {
    const userCount = messages.filter((m) => m.role === "user").length;
    if (userCount > 0 && userCount % 5 === 0 && userCount !== lastSavedRef.current) {
      lastSavedRef.current = userCount;
      fetch("/api/contribute-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages }),
      }).catch(() => {});
    }
  }, [messages, slug]);

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
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [
          { role: "assistant", content: "Hey! Thanks for being here. What you know took years to build, and most of it lives in your head where only a few people at a time can access it. We're going to change that. Over our conversations, I'll learn how you think, how you diagnose problems, and what makes your approach yours. No prep needed, no right answers. Just talk to me the way you'd talk to someone you're helping. Before we start: if you have any documents that capture your background, frameworks, or past work (a CV, a portfolio doc, case studies, anything), upload them using the paperclip icon below. It saves us time and lets me ask better questions from the start. If not, no worries. Just tell me what you do and who you help, and we'll go from there." },
          ...updated
        ], mentorSlug: slug }),
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

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const snapshot = assistantContent;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }
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

  const exportConversation = () => {
    // Also save to Telegram on export
    fetch("/api/contribute-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, messages }),
    }).catch(() => {});

    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contribute-${slug}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      // Inject file content as a user message and auto-send
      const fileMessage = `[Uploaded file: ${data.filename}]\n\n${data.content}`;
      await send(fileMessage);
    } catch {
      alert("Upload failed. Try copying and pasting the content instead.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="pt-20 flex flex-col h-screen bg-background">
      <div className="flex-1 flex justify-center px-6 py-6 min-h-0">
        <div className="w-full max-w-3xl bg-surface border border-border rounded-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-light border border-border text-accent">
                <IconTool size={18} stroke={1.5} aria-hidden />
              </span>
              <div>
                <h1 className="text-[20px] leading-none text-foreground">Mentor Session</h1>
                <p className="mono text-[11px] uppercase tracking-[0.06em] text-faint mt-1.5">{slug} &middot; {messageCount} exchanges</p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (confirm("Start over? This will clear the conversation.")) {
                      localStorage.removeItem(`fh-contribute-${slug}`);
                      setMessages([]);
                      setStarted(false);
                    }
                  }}
                  className="mono cursor-pointer text-[11px] tracking-[0.08em] uppercase text-muted border border-border px-3 py-1.5 rounded-md hover:text-[#F2777A] hover:border-[#F2777A]/25 hover:bg-[#F2777A]/10 transition"
                >
                  Reset
                </button>
                <button
                  onClick={exportConversation}
                  className="mono cursor-pointer text-[11px] tracking-[0.08em] uppercase text-muted border border-border px-3 py-1.5 rounded-md hover:text-foreground hover:bg-surface-light transition"
                >
                  Export
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="fh-scroll flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Auto-greeting if fresh session */}
            {!started && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed bg-accent text-[#1B1B18] rounded-lg rounded-bl-sm">
                  Hey! Thanks for being here. What you know took years to build, and most of it lives in your head where only a few people at a time can access it. We&apos;re going to change that. Over our conversations, I&apos;ll learn how you think, how you diagnose problems, and what makes your approach yours. No prep needed, no right answers. Just talk to me the way you&apos;d talk to someone you&apos;re helping. Before we start: if you have any documents that capture your background, frameworks, or past work (a CV, a portfolio doc, case studies, anything), upload them using the paperclip icon below. It saves us time and lets me ask better questions from the start. If not, no worries. Just tell me what you do and who you help, and we&apos;ll go from there.
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

            <div ref={bottomRef} />
          </div>

          {/* Progress bar */}
          <div className="px-6 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((messageCount / 40) * 100, 100)}%` }}
                />
              </div>
              <span className="mono text-[11px] uppercase tracking-[0.06em] text-faint shrink-0">{messageCount} of ~40 exchanges</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border px-6 py-4">
            <div className="flex gap-2 sm:gap-3 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={streaming || uploading}
                title="Upload a file (.txt, .pdf, .docx, .md)"
                className="cursor-pointer text-muted hover:text-foreground border border-border px-3 py-3.5 rounded-md hover:bg-surface-light transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {uploading ? (
                  <span className="mono animate-pulse text-[12px]">...</span>
                ) : (
                  <IconPaperclip size={18} stroke={1.5} aria-hidden />
                )}
              </button>
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={started ? "Continue where you left off..." : "Start by telling me about yourself..."}
                rows={1}
                className="fh-scroll flex-1 rounded-md border border-border bg-background px-5 py-3.5 text-[15px] text-foreground placeholder:text-faint focus:border-accent/50 focus:outline-none transition resize-none overflow-y-auto"
                style={{ maxHeight: 200 }}
              />
              <button
                onClick={() => send()}
                disabled={streaming}
                className="mono shrink-0 bg-transparent text-accent border border-accent/70 px-7 py-3.5 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
