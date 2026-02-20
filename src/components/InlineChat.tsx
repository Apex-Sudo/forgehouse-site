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
    <div className="border border-border bg-surface/50 max-w-2xl mx-auto">
      {!started && (
        <div className="p-6 pb-3">
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-sm border border-border px-4 py-2 text-muted hover:text-foreground hover:border-amber/40 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {started && (
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {/* User bubble */}
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2.5 text-sm leading-relaxed rounded-lg max-w-[85%]">
              {userMessage}
            </div>
          </div>

          {/* Assistant bubble */}
          {(assistantMessage || streaming) && (
            <div className="flex justify-start">
              <div
                ref={responseRef}
                className="bg-gray-800 text-white px-4 py-2.5 text-sm leading-relaxed rounded-lg max-w-[85%] whitespace-pre-wrap"
              >
                {assistantMessage || <span className="animate-pulse">●●●</span>}
              </div>
            </div>
          )}

          {done && (
            <div className="pt-2 text-center">
              <Link
                href="/chat/apex"
                className="text-amber hover:text-amber-dark text-sm font-semibold transition"
              >
                Continue this conversation &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {!started && (
        <div className="px-6 pb-6 pt-3">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or ask your own question..."
              rows={1}
              className="flex-1 bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition resize-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="bg-amber text-background px-6 py-3 font-semibold text-sm hover:bg-amber-dark transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { STARTERS };
