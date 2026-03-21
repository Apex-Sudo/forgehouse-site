"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

const CONTRIBUTE_ACCESS_CODE = "HYNXmhPKruI";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ExtractionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check access code from URL param or prompt
  useEffect(() => {
    const code = searchParams.get("code");
    if (code === CONTRIBUTE_ACCESS_CODE) {
      setAuthorized(true);
    }
  }, [searchParams]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0e1117] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-white/40 mb-6 text-sm">This page is invite-only. Enter your access code or use the link provided to you.</p>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && accessCode === CONTRIBUTE_ACCESS_CODE) {
                setAuthorized(true);
              }
            }}
            placeholder="Access code"
            className="w-full bg-[#1a1b2e] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#fbbf24] mb-4"
          />
          <button
            onClick={() => {
              if (accessCode === CONTRIBUTE_ACCESS_CODE) setAuthorized(true);
            }}
            className="w-full bg-[#fbbf24] text-[#0e1117] font-bold py-3 rounded-lg hover:opacity-90 transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

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
    <div className="pt-20 flex flex-col h-screen">
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2DC]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h1 className="font-bold text-sm">Mentor Session</h1>
                <p className="text-xs text-muted">{slug} &middot; {messageCount} exchanges</p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm("Start over? This will clear the conversation.")) {
                      localStorage.removeItem(`fh-contribute-${slug}`);
                      setMessages([]);
                      setStarted(false);
                    }
                  }}
                  className="text-xs text-[#999] hover:text-red-500 border border-[#E5E2DC] px-3 py-1.5 rounded-lg hover:border-red-400/30 transition"
                >
                  Reset
                </button>
                <button
                  onClick={exportConversation}
                  className="text-xs text-[#999] hover:text-[#1A1A1A] border border-[#E5E2DC] px-3 py-1.5 rounded-lg hover:border-[#B8916A]/30 transition"
                >
                  Export
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Auto-greeting if fresh session */}
            {!started && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-[#F5F3F0] border border-[#E5E2DC] px-5 py-3.5 text-sm leading-relaxed text-[#1A1A1A] rounded-2xl rounded-bl-md shadow-sm">
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
                  <div className="max-w-[80%] px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap bg-[#B8916A] text-white rounded-2xl rounded-br-md shadow-sm">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[80%] px-5 py-3.5 text-sm leading-relaxed bg-[#F5F3F0] border border-[#E5E2DC] text-[#1A1A1A] rounded-2xl rounded-bl-md shadow-sm">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-[#1A1A1A]">{children}</strong>,
                        em: ({ children }) => <em className="italic text-[#555]">{children}</em>,
                        ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 list-none">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal list-inside">{children}</ol>,
                        li: ({ children }) => (
                          <li className="flex items-start gap-2">
                            <span className="text-[#B8916A] mt-0.5 shrink-0">▸</span>
                            <span>{children}</span>
                          </li>
                        ),
                        h1: ({ children }) => <h3 className="font-bold text-[#1A1A1A] mb-2 text-base">{children}</h3>,
                        h2: ({ children }) => <h3 className="font-bold text-[#1A1A1A] mb-2 text-base">{children}</h3>,
                        h3: ({ children }) => <h3 className="font-semibold text-[#1A1A1A] mb-1.5 text-sm">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-[#B8916A]/40 pl-3 my-2 text-[#737373] italic">{children}</blockquote>
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
                <div className="flex justify-start">
                  <div className="bg-[#F5F3F0] border border-[#E5E2DC] px-5 py-3.5 text-sm rounded-2xl rounded-bl-md shadow-sm">
                    <span className="animate-pulse text-[#999]">●●●</span>
                  </div>
                </div>
              )}

            <div ref={bottomRef} />
          </div>

          {/* Progress bar */}
          <div className="px-6 py-2 border-t border-[#E5E2DC]">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-[#E5E2DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B8916A] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((messageCount / 40) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-[#999]">{messageCount} of ~40 exchanges</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E2DC] px-6 py-4">
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
                className="text-[#999] hover:text-[#1A1A1A] border border-[#E5E2DC] px-3 py-3 rounded-xl hover:border-[#B8916A]/30 transition disabled:opacity-50 shrink-0"
              >
                {uploading ? (
                  <span className="animate-pulse text-sm">...</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
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
                className="flex-1 bg-white border border-[#E5E2DC] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#C5C0B8] focus:outline-none focus:border-[#B8916A]/50 focus:ring-1 focus:ring-[#B8916A]/20 transition resize-none overflow-y-auto"
                style={{ maxHeight: 200 }}
              />
              <button
                onClick={() => send()}
                disabled={streaming}
                className="bg-[#B8916A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#A07B56] transition disabled:opacity-50"
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
