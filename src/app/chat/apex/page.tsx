"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { STARTERS } from "@/components/InlineChat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fh_email");
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check subscription on mount + after successful checkout redirect
  useEffect(() => {
    const email = getStoredEmail();
    if (email) setSubscriberEmail(email);

    const subscribed = searchParams.get("subscribed");
    if (subscribed === "1" && email) {
      // Just returned from checkout, verify
      fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.subscribed) {
            setShowPaywall(false);
            setSubscriberEmail(email);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (seeded) return;
    const q = searchParams.get("q");
    if (q) {
      setSeeded(true);
      setTimeout(() => send(q), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, seeded]);

  const startCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckingOut(false);
    }
  };

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
        body: JSON.stringify({
          messages: updated,
          email: subscriberEmail,
        }),
      });

      if (res.status === 403) {
        // Subscription required
        setShowPaywall(true);
        setMessages((prev) => prev.slice(0, -1)); // Remove the user message
        setStreaming(false);
        return;
      }

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

  return (
    <div className="pt-20 flex flex-col h-screen">
      {/* Chat container — centered glass panel */}
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl glass-card flex flex-col overflow-hidden shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
          {/* Chat header inside the card */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <span className="text-2xl">🔺</span>
            <div>
              <h1 className="font-bold text-sm">Apex</h1>
              <p className="text-xs text-muted">Decision-making partner</p>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Welcome */}
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

          {/* Paywall overlay */}
          {showPaywall && (
            <div className="px-6 py-6 border-t border-white/[0.06] bg-white/[0.02]">
              <div className="max-w-md mx-auto text-center space-y-4">
                <p className="text-sm font-medium text-foreground">
                  Your free conversation is over.
                </p>
                <p className="text-sm text-muted">
                  Keep access to every agent, anytime, for $19/month. Cancel whenever.
                </p>
                {!subscriberEmail ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-[#3B82F6]/40 transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            localStorage.setItem("fh_email", val);
                            setSubscriberEmail(val);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) {
                          localStorage.setItem("fh_email", val);
                          setSubscriberEmail(val);
                        }
                      }}
                    />
                    <p className="text-xs text-muted">Enter email, then subscribe</p>
                  </div>
                ) : (
                  <button
                    onClick={startCheckout}
                    disabled={checkingOut}
                    className="bg-[#3B82F6] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#2563EB] transition disabled:opacity-50"
                  >
                    {checkingOut ? "Redirecting..." : "Subscribe — $19/month"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Input area inside the card */}
          {!showPaywall && (
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
          )}
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
