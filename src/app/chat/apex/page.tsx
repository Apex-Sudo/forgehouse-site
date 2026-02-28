"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { STARTERS } from "@/components/InlineChat";
import ChatMessage from "@/components/ChatMessage";
import MemoryBanner from "@/components/MemoryBanner";
import SignInNudge from "@/components/SignInNudge";
import UpgradePrompt from "@/components/UpgradePrompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check subscription status for signed-in users
  useEffect(() => {
    if (!session?.user) return;
    // We show the banner for signed-in non-subscribers
    // We determine subscription by trying to fetch insights (403 = not subscribed)
    fetch("/api/insights?mentor=apex")
      .then((r) => {
        if (r.status === 403) {
          setIsSubscribed(false);
          setShowBanner(true);
        } else if (r.ok) {
          setIsSubscribed(true);
          setShowBanner(false);
        }
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (seeded) return;
    const q = searchParams.get("q");
    if (q) {
      setSeeded(true);
      setTimeout(() => send(q), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, seeded]);

  const createConversation = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentor_slug: "apex" }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.id);
        return data.id;
      }
    } catch { /* ignore */ }
    return null;
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    // Create conversation on first message if signed in
    let convId = conversationId;
    if (session?.user && !convId) {
      convId = await createConversation();
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          ...(convId ? { conversation_id: convId } : {}),
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

  const loadConversation = (id: string, msgs: Message[]) => {
    setConversationId(id);
    setMessages(msgs);
  };

  const startNew = () => {
    setConversationId(null);
    setMessages([]);
  };

  return (
    <div className={`flex flex-col ${session ? "pt-4 h-full" : "pt-20 h-screen"}`}>
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <span className="text-2xl">🔺</span>
            <div>
              <h1 className="font-bold text-sm">Apex</h1>
              <p className="text-xs text-muted">Decision-making partner</p>
            </div>
          </div>

          {/* Sign-in nudge for anonymous users after 2 messages */}
          {!session && status !== "loading" && messages.filter(m => m.role === "user").length >= 2 && (
            <SignInNudge />
          )}

          {/* Memory banner for free tier */}
          {showBanner && <MemoryBanner />}

          {/* Upgrade prompt for signed-in free tier users after 5 messages */}
          {session && !isSubscribed && messages.filter(m => m.role === "user").length >= 5 && (
            <UpgradePrompt mentorSlug="colin-chapman" mentorName="Colin Chapman" mentorPrice={150} />
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                What&apos;s the decision you&apos;re trying to make?
              </div>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto pt-4">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-sm bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full text-muted hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.12] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                content={m.content}
                mentorSlug="apex"
                isSubscribed={isSubscribed}
              />
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

          {/* Input area */}
          <div className="border-t border-white/[0.06] px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
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

export default function ChatApex() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
