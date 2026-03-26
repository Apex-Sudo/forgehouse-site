"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import ChatMessage from "@/components/ChatMessage";
import MemoryBanner from "@/components/MemoryBanner";
import UpgradePrompt from "@/components/UpgradePrompt";
import { SCENARIOS } from "@/lib/scenarios";
import { IconSearch, IconMail, IconTarget } from "@tabler/icons-react";
import { useTokenBuffer } from "@/hooks/useTokenBuffer";

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  search: <IconSearch size={20} />,
  mail: <IconMail size={20} />,
  target: <IconTarget size={20} />,
};

const DEFAULT_STARTERS = [
  "I want to get into luxury short-term rentals. Where do I even start?",
  "How do I find the right properties to list without owning them?",
  "I keep getting guests who haggle on price. How do I attract better guests?",
  "How do I go from budget rooms to luxury villas without a huge budget?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_MESSAGE_LIMIT = 5;

// Invite codes bypass the paywall — unlimited free messages
const VALID_INVITE_CODES = new Set(["alexw", "steve", "ray", "colin", "amber", "mark", "test"]);

function ChatContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const isInvited = inviteCode ? VALID_INVITE_CODES.has(inviteCode) : false;
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hitPaywall, setHitPaywall] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const [gateRemaining, setGateRemaining] = useState<number | null>(null);
  const [gateEmail, setGateEmail] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [gateCodeSent, setGateCodeSent] = useState(false);
  const [gateSending, setGateSending] = useState(false);
  const [gateError, setGateError] = useState("");
  const [starters, setStarters] = useState<string[]>(DEFAULT_STARTERS);
  const [showWelcome, setShowWelcome] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const tokenBuffer = useTokenBuffer((content) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { role: "assistant", content };
      return copy;
    });
  });

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLocked = !isInvited && !isSubscribed && userMessageCount >= FREE_MESSAGE_LIMIT;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const userEmail = session?.user?.email;
  const subscribedParam = searchParams.get("subscribed");
  const newParam = searchParams.get("new");
  const scenarioParam = searchParams.get("scenario");
  const convParam = searchParams.get("conv");
  const qParam = searchParams.get("q");

  useEffect(() => {
    if (!userEmail) return;
    fetch("/api/starters?mentor=leon-freier")
      .then((r) => r.json())
      .then((data) => {
        if (data.starters?.length >= 4) setStarters(data.starters);
      })
      .catch(() => {});
  }, [userEmail]);

  useEffect(() => {
    if (subscribedParam === "true") {
      setShowWelcome(true);
      setIsSubscribed(true);
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      window.history.replaceState({}, "", "/chat/leon-freier");
      return () => clearTimeout(timer);
    }
  }, [subscribedParam]);

  useEffect(() => {
    if (isInvited) return;
    fetch("/api/gate-check")
      .then((r) => r.json())
      .then((data) => {
        if (data.gate === "login") {
          setShowLoginGate(true);
          window.posthog?.capture("gate_hit", { mentor: "leon-freier", trigger: "preemptive" });
        } else if (data.gate === "paywall") {
          setHitPaywall(true);
          window.posthog?.capture("paywall_hit", { mentor: "leon-freier", trigger: "preemptive" });
        }
        if (data.remaining !== null) {
          setGateRemaining(data.remaining);
        }
      })
      .catch(() => {});
  }, [isInvited, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    fetch("/api/profile")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          if (!data.profile?.profile_complete) {
            window.location.href = "/chat/onboarding?redirect=/chat/leon-freier";
          }
        }
      })
      .catch(() => {});
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    fetch("/api/insights?mentor=leon-freier")
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
  }, [userEmail]);

  useEffect(() => {
    if (newParam === "true") {
      setConversationId(null);
      setMessages([]);
      setSummary(null);
      setActiveScenario(null);
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
      window.history.replaceState({}, "", "/chat/leon-freier");
    }
  }, [newParam]);

  useEffect(() => {
    if (!scenarioParam || !userEmail) return;
    const scenario = SCENARIOS.find((s) => s.id === scenarioParam);
    if (scenario && messages.length === 0) {
      setActiveScenario(scenario.id);
      setMessages([{ role: "assistant", content: scenario.questions[0] }]);
      window.history.replaceState({}, "", "/chat/leon-freier");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioParam, userEmail]);

  useEffect(() => {
    if (!convParam || !userEmail) return;
    setConversationId(convParam);
    fetch(`/api/conversations/${convParam}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.messages?.length) {
          setMessages(data.messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })));
        }
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => {});
    window.history.replaceState({}, "", "/chat/leon-freier");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convParam, userEmail]);

  useEffect(() => {
    if (seeded) return;
    if (qParam) {
      setSeeded(true);
      setTimeout(() => send(qParam), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, seeded]);

  const createConversation = async (scenarioType?: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentor_slug: "leon-freier", ...(scenarioType ? { scenario_type: scenarioType } : {}) }),
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
    setMessages([...updated, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    let convId = conversationId;
    if (session?.user && !convId) {
      convId = await createConversation(activeScenario ?? undefined);
    }

    try {
      const res = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mentor: "leon-freier",
          ...(convId ? { conversation_id: convId } : {}),
          ...(!convId ? { messages: updated } : {}),
          ...(activeScenario ? { scenario_id: activeScenario } : {}),
          ...(isInvited ? { invite: inviteCode } : {}),
        }),
      });

      if (res.status === 403) {
        setStreaming(false);
        setMessages(updated);
        setShowLoginGate(true);
        window.posthog?.capture("gate_hit", { mentor: "leon-freier", trigger: "message_blocked" });
        return;
      }

      if (res.status === 402) {
        setHitPaywall(true);
        setMessages((prev) => prev.slice(0, -2));
        setStreaming(false);
        window.posthog?.capture("paywall_hit", { mentor: "leon-freier", trigger: "message_blocked" });
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: err.error || "Something went wrong." };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      tokenBuffer.reset();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tokenBuffer.push(decoder.decode(value, { stream: true }));
      }

      const finalContent = tokenBuffer.flush();
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: finalContent };
        return copy;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setStreaming(false);
      // Schedule auto-summary after 30s idle if 3+ user messages
      scheduleSummary(convId);
      // Recheck gate so next message shows login/paywall preemptively
      if (!isInvited) {
        fetch("/api/gate-check")
          .then((r) => r.json())
          .then((data) => {
            if (data.gate === "login" && !showLoginGate) {
              setShowLoginGate(true);
              window.posthog?.capture("gate_hit", { mentor: "leon-freier", trigger: "recheck" });
            } else if (data.gate === "paywall" && !hitPaywall) {
              setHitPaywall(true);
              window.posthog?.capture("paywall_hit", { mentor: "leon-freier", trigger: "recheck" });
            }
            if (data.remaining !== null) setGateRemaining(data.remaining);
          })
          .catch(() => {});
      }
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
    setActiveScenario(null);
    if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-3" style={{ background: "#F7F5F2" }}>
      <div className="flex-1 flex justify-center min-h-0">
        <div className="w-full max-w-5xl bg-white flex flex-col overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.06)] border border-foreground/[0.08] rounded-2xl h-full">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-foreground/[0.08]">
            <Image src="/mentors/leon-freier.png" alt="Leon Freier" width={36} height={36} className="rounded-full object-cover shrink-0" />
            <div className="flex-1">
              <h1 className="font-bold text-sm">Leon Freier</h1>
              <p className="text-xs text-muted">Luxury Short-Term Rental Operator</p>
            </div>
          </div>

          {showWelcome && (
            <div className="mx-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">You&apos;re in.</p>
                  <p className="text-xs text-muted mt-0.5">Unlimited access to Leon. Your conversations are saved. Ask him anything.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-muted hover:text-foreground text-xs ml-4 cursor-pointer">✕</button>
              </div>
            </div>
          )}

          {showBanner && <MemoryBanner />}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {summary && messages.length > 0 && (
              <div className="bg-[#F5F3F0] border border-foreground/[0.06] rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Session Summary</p>
                <div className="text-sm text-foreground/70 whitespace-pre-line">{summary}</div>
              </div>
            )}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-[#F5F3F0] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                Before I can help, I need to understand your situation. What kind of properties are you working with, where are they located, and what does your guest experience look like right now?
              </div>
            </div>

            {messages.length === 0 && (
              <>
                <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto pt-4">
                  {starters.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-sm bg-transparent border border-foreground/[0.12] px-4 py-2 rounded-full text-muted hover:text-foreground hover:bg-foreground/[0.04] hover:border-foreground/[0.2] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>

              </>
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
                  mentorSlug="leon-freier"
                  isSubscribed={isSubscribed}
                  context={context}
                  isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                />
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Input or Paywall */}
          {showLoginGate ? (
            <div className="px-6 py-6">
              <div className="max-w-sm mx-auto rounded-2xl border border-[#E5E2DC] p-8 text-center" style={{ background: "#FAFAF8", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <p className="text-sm text-[#1A1A1A] mb-1 font-medium">
                  Thanks for trying ForgeHouse
                </p>
                <p className="text-xs text-[#737373] mb-4">
                  Sign in to get Leon&apos;s answer and keep the conversation going.
                </p>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <a
                    href="/sign-in?callbackUrl=/chat/leon-freier"
                    className="bg-[#0A66C2] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#004182] transition text-center"
                  >
                    Continue with LinkedIn
                  </a>
                  <a
                    href="/sign-in?callbackUrl=/chat/leon-freier"
                    className="bg-white text-[#1A1A1A] border border-[#DDD] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition text-center"
                  >
                    Continue with Google
                  </a>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-[#E5E2DC]" />
                      <span className="text-[#999] text-xs">or</span>
                      <div className="flex-1 h-px bg-[#E5E2DC]" />
                    </div>
                    {!gateCodeSent ? (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setGateError("");
                        setGateSending(true);
                        try {
                          const res = await fetch("/api/auth/send-code", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: gateEmail }),
                          });
                          if (res.ok) {
                            setGateCodeSent(true);
                          } else {
                            const data = await res.json();
                            setGateError(data.error || "Failed to send code");
                          }
                        } catch { setGateError("Failed to send code"); }
                        setGateSending(false);
                      }} className="space-y-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={gateEmail}
                          onChange={(e) => setGateEmail(e.target.value)}
                          required
                          className="w-full bg-white border border-[#DDD] text-[#1A1A1A] px-4 py-3 rounded-xl text-sm placeholder:text-[#999] focus:outline-none focus:border-amber"
                        />
                        <button type="submit" disabled={gateSending} className="w-full bg-white text-[#1A1A1A] border border-[#DDD] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition disabled:opacity-50">
                          {gateSending ? "Sending..." : "Continue with Email"}
                        </button>
                        {gateError && <p className="text-red-500 text-xs text-center">{gateError}</p>}
                      </form>
                    ) : (
                      <form onSubmit={async (e) => { e.preventDefault(); setGateError(""); const res = await signIn("credentials", { email: gateEmail, code: gateCode, redirect: false }); if (res?.error) { setGateError("Invalid or expired code. Try again."); } else if (res?.ok) { window.location.href = "/chat/leon-freier"; } }} className="space-y-2">
                        <p className="text-muted text-xs text-center">Code sent to <span className="text-foreground">{gateEmail}</span></p>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={gateCode}
                          onChange={(e) => setGateCode(e.target.value.replace(/\D/g, ""))}
                          required
                          className="w-full bg-white/[0.03] border border-white/[0.08] text-foreground px-4 py-3 rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-white/[0.2] text-center tracking-[0.3em] text-lg"
                        />
                        <button type="submit" className="w-full bg-white/[0.06] text-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/[0.1] transition">Verify & Sign In</button>
                        <button type="button" onClick={() => { setGateCodeSent(false); setGateCode(""); setGateError(""); }} className="w-full text-muted text-xs hover:text-foreground transition cursor-pointer">Use a different email</button>
                        {gateError && <p className="text-red-400 text-xs text-center">{gateError}</p>}
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isLocked || hitPaywall ? (
            <div className="border-t border-white/[0.06] px-6 py-6">
              <div className="text-center">
                <p className="text-sm text-foreground/90 mb-1 font-medium">
                  You&apos;ve used your {FREE_MESSAGE_LIMIT} free messages.
                </p>
                <p className="text-xs text-muted mb-4">
                  Subscribe to keep talking to Leon and save your conversations.
                </p>
                <UpgradePrompt mentorSlug="leon-freier" mentorName="Leon Freier" mentorPrice={1} />
              </div>
            </div>
          ) : (
            <div className="border-t border-foreground/[0.08] px-6 py-4">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your situation..."
                  rows={1}
                  className="flex-1 bg-transparent border border-foreground/[0.12] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-[#B8916A]/40 transition resize-none"
                />
                <button
                  onClick={() => send()}
                  disabled={streaming}
                  className="bg-[#B8916A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#A07B56] transition disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <p className="text-[11px] text-zinc-600 text-center mt-2">Your conversations are private. We don&apos;t sell or share your data.</p>
              {!isInvited && !isSubscribed && userMessageCount >= 3 && (
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

export default function ChatLeonFreier() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
