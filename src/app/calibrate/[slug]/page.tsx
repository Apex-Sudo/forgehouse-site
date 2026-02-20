"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CalibrationPage() {
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

  // Save on every update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`fh-calibrate-${slug}`, JSON.stringify(messages));
    }
  }, [messages, slug]);

  // Load extraction context from contribute session
  const getExtractionContext = (): string | undefined => {
    const extraction = localStorage.getItem(`fh-contribute-${slug}`);
    if (!extraction) return undefined;
    const msgs = JSON.parse(extraction) as Message[];
    // Compress: just grab assistant summaries and user key statements
    return msgs
      .map((m) => `[${m.role}]: ${m.content}`)
      .join("\n\n")
      .slice(0, 8000); // Cap context size
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
          messages: updated,
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
    <div className="pt-16 flex flex-col h-screen">
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h1 className="font-bold text-sm">Calibration Session</h1>
                <p className="text-xs text-muted">{slug} &middot; Phase: {phases}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={exportCorrections}
                className="text-xs text-muted hover:text-foreground border border-white/[0.08] px-3 py-1.5 rounded-lg hover:border-white/[0.15] transition"
              >
                Export
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {!started && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                  Welcome back! Your agent is built and ready for you to put it through its paces. I&apos;m going to show you how it handles different situations, and you tell me where it nails it and where it&apos;s off. Think of it like training a new team member who&apos;s read all your playbooks but hasn&apos;t sat in the room with you yet. Let&apos;s start with something simple.
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#3B82F6] text-white rounded-2xl"
                      : "bg-white/[0.04] border border-white/[0.06] text-foreground rounded-2xl"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {streaming &&
              messages.length > 0 &&
              messages[messages.length - 1].content === "" && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm rounded-2xl">
                    <span className="animate-pulse text-muted">●●●</span>
                  </div>
                </div>
              )}

            <div ref={bottomRef} />
          </div>

          {/* Phase indicator */}
          <div className="px-6 py-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {["Voice", "Frameworks", "Edge Cases", "Final"].map((p) => (
                  <div
                    key={p}
                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                      phases === p ? "bg-[#3B82F6]" : corrections > ["Voice", "Frameworks", "Edge Cases", "Final"].indexOf(p) * 5 ? "bg-[#3B82F6]/40" : "bg-white/[0.06]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">{phases} phase</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me what's right and what's off..."
                rows={1}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-[#3B82F6]/40 transition resize-none"
              />
              <button
                onClick={() => send()}
                disabled={streaming}
                className="bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#2563EB] transition disabled:opacity-50"
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
