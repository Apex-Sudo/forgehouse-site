"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const STARTERS = [
  "I'm stuck between two GTM strategies",
  "My cofounder and I disagree on pricing",
  "I have traction but no repeatable channel",
  "Should I raise or bootstrap?",
];

export default function InlineChat() {
  const [input, setInput] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streaming) {
      responseRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [assistantMessage, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const msg = text.trim();
    setUserMessage(msg);
    setStarted(true);
    setInput("");
    setStreaming(true);
    setAssistantMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: msg }] }),
      });

      if (!res.ok) {
        setAssistantMessage("Something went wrong. Try again.");
        setStreaming(false);
        setDone(true);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        content += decoder.decode(value, { stream: true });
        setAssistantMessage(content);
      }
    } catch {
      setAssistantMessage("Connection error. Please try again.");
    } finally {
      setStreaming(false);
      setDone(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="glass-card max-w-3xl mx-auto min-h-[400px] flex flex-col overflow-hidden">
      {/* macOS window chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>

      {!started && (
        <div className="flex-1 flex flex-col">
          <div className="p-6 pb-3">
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-sm bg-white/[0.04] text-[#EDEDED] border border-white/[0.08] px-4 py-2 rounded-full hover:bg-white/[0.08] hover:border-white/[0.12] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto px-6 pb-6 pt-3">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Or ask your own question..."
                rows={1}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#EDEDED] placeholder:text-[#737373] focus:outline-none focus:border-[#3B82F6]/40 transition resize-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="bg-[#3B82F6] text-white px-6 py-3 font-semibold text-sm rounded-xl hover:bg-[#2563EB] transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {started && (
        <div className="flex-1 p-6 space-y-4 max-h-[450px] overflow-y-auto">
          {/* User bubble */}
          <div className="flex justify-end">
            <div className="bg-[#3B82F6] text-white px-4 py-2.5 text-sm leading-relaxed rounded-2xl max-w-[85%]">
              {userMessage}
            </div>
          </div>

          {/* Assistant bubble */}
          {(assistantMessage || streaming) && (
            <div className="flex justify-start">
              <div
                ref={responseRef}
                className="bg-white/[0.06] text-[#EDEDED] px-4 py-2.5 text-sm leading-relaxed rounded-2xl max-w-[85%] whitespace-pre-wrap"
              >
                {assistantMessage || <span className="animate-pulse text-[#737373]">●●●</span>}
              </div>
            </div>
          )}

          {done && (
            <div className="pt-2 text-center">
              <Link
                href="/chat/apex"
                className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-semibold transition"
              >
                Continue this conversation &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { STARTERS };
