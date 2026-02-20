"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { STARTERS } from "@/components/InlineChat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-send from homepage starter buttons
  useEffect(() => {
    if (seeded) return;
    const q = searchParams.get("q");
    if (q) {
      setSeeded(true);
      // Small delay to let component mount
      setTimeout(() => send(q), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, seeded]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
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

      // Add empty assistant message
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

  return (
    <div className="pt-16 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🔺</span>
        <div>
          <h1 className="font-bold">Apex</h1>
          <p className="text-xs text-muted">Decision-making partner</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {/* Welcome message (always shown) */}
        <div className="flex justify-start">
          <div className="max-w-[80%] md:max-w-[60%] px-5 py-3 text-sm leading-relaxed bg-gray-800 text-white rounded-lg">
            What&apos;s the decision you&apos;re trying to make?
          </div>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
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
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[60%] px-5 py-3 text-sm leading-relaxed rounded-lg whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {streaming &&
          messages.length > 0 &&
          messages[messages.length - 1].content === "" && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white px-5 py-3 text-sm rounded-lg">
                <span className="animate-pulse">●●●</span>
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-amber/60 transition resize-none"
          />
          <button
            onClick={() => send()}
            disabled={streaming}
            className="bg-amber text-background px-6 py-3 font-semibold text-sm hover:bg-amber-dark transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatApex() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
