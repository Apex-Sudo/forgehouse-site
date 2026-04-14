"use client";
import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { readNdjsonStream } from "@/lib/agent/helper/stream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CalibrationPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e1117] flex items-center justify-center"><span className="text-white/40 text-sm">Loading...</span></div>}>
      <CalibrationPage />
    </Suspense>
  );
}

function CalibrationPage() {
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

  // Load saved calibration session
  useEffect(() => {
    const saved = localStorage.getItem(`fh-calibrate-${slug}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      setMessages(parsed);
      setStarted(true);
    }
  }, [slug]);

  // Save on every update (localStorage + Supabase)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`fh-calibrate-${slug}`, JSON.stringify(messages));
      fetch("/api/calibrate-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages }),
      }).catch(() => {});
    }
  }, [messages, slug]);

  const [remoteContext, setRemoteContext] = useState<string | undefined>(undefined);

  // Load extraction context from localStorage or Supabase fallback
  useEffect(() => {
    const local = localStorage.getItem(`fh-contribute-${slug}`);
    if (local) return;
    fetch(`/api/extraction-context?slug=${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.context) setRemoteContext(data.context); })
      .catch(() => {});
  }, [slug]);

  const getExtractionContext = (): string | undefined => {
    const extraction = localStorage.getItem(`fh-contribute-${slug}`);
    if (extraction) {
      const msgs = JSON.parse(extraction) as Message[];
      return msgs
        .map((m) => `[${m.role}]: ${m.content}`)
        .join("\n\n")
        .slice(0, 8000);
    }
    return remoteContext;
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
    { role: "assistant", content: "🎯 Let's build your coaching style!\n\nThis first step will take ~1.5-2 hours. You can pause anytime.\n[INFOGRAPHIC PLACEHOLDER]\n\n1. Start with your CV upload\n2. Answer key domain questions\n3. Review system prompts for tone" },
            ...updated
          ],
          mentorSlug: slug,
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
    a.download = `calibration-${slug}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const corrections = messages.filter((m) => m.role === "user").length;
  const phases = corrections < 5 ? "Voice" : corrections < 15 ? "Frameworks" : corrections < 20 ? "Edge Cases" : "Final";

  return (
    <div className="pt-20 flex flex-col h-screen">
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2DC]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h1 className="font-bold text-sm">Calibration Session</h1>
                <p className="text-xs text-[#999]">{slug} &middot; Phase: {phases}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm("Start over? This will clear the conversation.")) {
                      localStorage.removeItem(`fh-calibrate-${slug}`);
                      setMessages([]);
                      setStarted(false);
                    }
                  }}
                  className="text-xs text-[#999] hover:text-red-500 border border-[#E5E2DC] px-3 py-1.5 rounded-lg hover:border-red-400/30 transition"
                >
                  Reset
                </button>
                <button
                  onClick={exportCorrections}
                  className="text-xs text-[#999] hover:text-[#1A1A1A] border border-[#E5E2DC] px-3 py-1.5 rounded-lg hover:border-[#B8916A]/30 transition"
                >
                  Export
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {!started && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-[#F5F3F0] border border-[#E5E2DC] px-5 py-3.5 text-sm leading-relaxed text-[#1A1A1A] rounded-2xl rounded-bl-md shadow-sm">
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

          {/* Phase indicator */}
          <div className="px-6 py-2 border-t border-[#E5E2DC]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {["Voice", "Frameworks", "Edge Cases", "Final"].map((p) => (
                  <div
                    key={p}
                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                      phases === p ? "bg-[#B8916A]" : corrections > ["Voice", "Frameworks", "Edge Cases", "Final"].indexOf(p) * 5 ? "bg-[#B8916A]/40" : "bg-[#E5E2DC]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#999]">{phases} phase</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E2DC] px-6 py-4">
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
