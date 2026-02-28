"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import ChatMessage from "@/components/ChatMessage";
import ConversationHistory from "@/components/ConversationHistory";
import SavedInsightsPanel from "@/components/SavedInsightsPanel";
import MemoryBanner from "@/components/MemoryBanner";
// SignInNudge no longer needed — Colin requires auth
import UpgradePrompt from "@/components/UpgradePrompt";

const STARTERS = [
  "Our outbound isn't converting. Where do I even start diagnosing this?",
  "How do I build an ICP that's actually useful, not just 'companies with 50+ employees'?",
  "We're getting meetings but deals stall after the first call. What's going wrong?",
  "I'm a solo founder doing my own outbound. How do I structure my week?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_MESSAGE_LIMIT = 5;

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
  const [hitPaywall, setHitPaywall] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLocked = !isSubscribed && userMessageCount >= FREE_MESSAGE_LIMIT;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show welcome banner after successful subscription
  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      setShowWelcome(true);
      setIsSubscribed(true);
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      // Clean URL
      window.history.replaceState({}, "", "/chat/colin-chapman");
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Redirect anonymous users to sign-in
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/sign-in?callbackUrl=/chat/colin-chapman";
    }
  }, [status]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/insights?mentor=colin-chapman")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setIsSubscribed(data.isSubscribed);
          setShowBanner(!data.isSubscribed);
        } else {
          setIsSubscribed(false);
          setShowBanner(true);
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
        body: JSON.stringify({ mentor_slug: "colin-chapman" }),
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

    let convId = conversationId;
    if (session?.user && !convId) {
      convId = await createConversation();
    }

    try {
      const res = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          mentor: "colin-chapman",
          ...(convId ? { conversation_id: convId } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        if (err.code === "FREE_LIMIT_REACHED") {
          setHitPaywall(true);
          // Remove the user message we just added (it was rejected)
          setMessages((prev) => prev.slice(0, -1));
          setStreaming(false);
          return;
        }
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
      // Schedule auto-summary after 30s idle if 3+ user messages
      scheduleSummary(convId);
    }
  };

  const scheduleSummary = (convId: string | null) => {
    if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
    if (!convId) return;
    summaryTimerRef.current = setTimeout(async () => {
      // Check current message count at trigger time
      const currentUserMsgCount = messages.filter((m) => m.role === "user").length + 1; // +1 for the one we just sent
      if (currentUserMsgCount >= 3) {
        try {
          const res = await fetch(`/api/conversations/${convId}/summarize`, { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            if (data.summary) setSummary(data.summary);
          }
        } catch { /* silent */ }
      }
    }, 30000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const loadConversation = (id: string, msgs: Message[], convSummary?: string | null) => {
    setConversationId(id);
    setMessages(msgs);
    setSummary(convSummary ?? null);
  };

  const startNew = () => {
    setConversationId(null);
    setMessages([]);
    setSummary(null);
    if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
  };

  // Show loading while checking auth or redirecting
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="pt-20 flex flex-col h-screen items-center justify-center">
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="pt-20 flex flex-col h-screen">
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            {session && status === "authenticated" && (
              <ConversationHistory
                mentorSlug="colin-chapman"
                onSelect={loadConversation}
                onNew={startNew}
              />
            )}
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <h1 className="font-bold text-sm">Colin Chapman</h1>
              <p className="text-xs text-muted">GTM & Outbound Sales Mentor</p>
            </div>
            {session && status === "authenticated" && (
              <SavedInsightsPanel mentorSlug="colin-chapman" />
            )}
          </div>

          {showWelcome && (
            <div className="mx-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">You&apos;re in.</p>
                  <p className="text-xs text-muted mt-0.5">Unlimited access to Colin. Your conversations are saved. Ask him anything.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-muted hover:text-foreground text-xs ml-4 cursor-pointer">✕</button>
              </div>
            </div>
          )}

          {showBanner && <MemoryBanner />}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {summary && messages.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Session Summary</p>
                <div className="text-sm text-foreground/70 whitespace-pre-line">{summary}</div>
              </div>
            )}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                Before I can help, I need to understand your situation. What are you selling, who are you selling it to, and what does your current outbound look like?
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

            {messages.map((m, i) => {
              // For assistant messages, find the preceding user message as context
              const context = m.role === "assistant" && i > 0
                ? messages.slice(0, i).reverse().find((prev) => prev.role === "user")?.content
                : undefined;
              return (
                <ChatMessage
                  key={i}
                  role={m.role}
                  content={m.content}
                  mentorSlug="colin-chapman"
                  isSubscribed={isSubscribed}
                  context={context}
                />
              );
            })}

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

          {/* Input or Paywall */}
          {isLocked || hitPaywall ? (
            <div className="border-t border-white/[0.06] px-6 py-6">
              <div className="text-center">
                <p className="text-sm text-foreground/90 mb-1 font-medium">
                  You&apos;ve used your {FREE_MESSAGE_LIMIT} free messages.
                </p>
                <p className="text-xs text-muted mb-4">
                  Subscribe to keep talking to Colin and save your conversations.
                </p>
                <UpgradePrompt mentorSlug="colin-chapman" mentorName="Colin Chapman" mentorPrice={150} />
              </div>
            </div>
          ) : (
            <div className="border-t border-white/[0.06] px-6 py-4">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your situation..."
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
              {!isSubscribed && userMessageCount >= 3 && (
                <p className="text-xs text-muted text-center mt-2">
                  {FREE_MESSAGE_LIMIT - userMessageCount} free message{FREE_MESSAGE_LIMIT - userMessageCount !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatColinChapman() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
