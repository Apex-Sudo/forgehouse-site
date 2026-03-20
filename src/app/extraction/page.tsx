"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatMessage from "@/components/ChatMessage";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in?callbackUrl=/extraction");
    }
  }, [status, router]);

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
        body: JSON.stringify({ messages: updated }),
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
        setMessages([...updated, { role: "assistant", content: assistantContent }]);
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#999]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="border-b border-[#E5E2DC] bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Mentor Extraction</h1>
            <p className="text-sm text-[#999]">
              {session?.user?.name ? `Session with ${session.user.name}` : "Building your mentor agent"}
              {exchangeCount > 0 && ` · ${exchangeCount} exchanges`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber/10 text-amber font-medium">
              {exchangeCount < 15
                ? "Phase 1: Foundation"
                : exchangeCount < 35
                ? "Phase 2: Frameworks"
                : exchangeCount < 50
                ? "Phase 3: Patterns"
                : exchangeCount < 65
                ? "Phase 4: Pressure Testing"
                : "Phase 5: Voice & Nuance"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔧</span>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Ready to extract your expertise</h2>
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

      {/* Input */}
      {messages.length > 0 && (
        <div className="border-t border-[#E5E2DC] bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thinking..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[#E5E2DC] px-4 py-3 text-[15px] focus:outline-none focus:border-amber/50 placeholder:text-[#C5C0B8]"
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="self-end bg-amber text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40"
            >
              {streaming ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
