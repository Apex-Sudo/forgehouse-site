"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import ChatMessage from "@/components/ChatMessage";
import MemoryBanner from "@/components/MemoryBanner";
import UpgradePrompt from "@/components/UpgradePrompt";
import { parseStreamChunk, extractArtifacts, type Artifact } from "@/lib/agent/helper/stream";
import { useTokenBuffer } from "@/hooks/useTokenBuffer";
import { useAppShell } from "@/components/AppShellContext";

const FALLBACK_AVATAR = "/mentors/default-avatar.svg";
function safeAvatar(url: string | undefined | null): string {
  if (!url || url.includes("default-avatar.png")) return FALLBACK_AVATAR;
  return url;
}

interface MentorConfig {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  welcome_message: string;
  default_starters: string[];
  monthly_price: number;
}

interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: string[];
  system_prompt_addition: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  artifacts?: Artifact[];
}

const FREE_MESSAGE_LIMIT = 5;

const VALID_INVITE_CODES = new Set(["alexw", "steve", "ray", "colin", "amber", "mark", "test"]);

type MentorResolveState = "pending" | "ok" | "missing";

function MentorChatComingSoon({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F5F2" }}>
      <div className="w-full max-w-md bg-white border border-foreground/[0.08] rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.06)] px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">ForgeHouse chat</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Coming soon</h1>
        <p className="text-sm text-muted leading-relaxed mb-1">
          We don&apos;t have an active mentor chat for <span className="font-medium text-foreground">{slug}</span> yet.
        </p>
        <p className="text-sm text-muted leading-relaxed mb-8">
          Check back later or pick someone who&apos;s live today.
        </p>
        <Link
          href="/mentors"
          className="inline-flex items-center justify-center rounded-xl bg-[#B8916A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A07B56] transition"
        >
          Browse mentors
        </Link>
      </div>
    </div>
  );
}

function ScenariosDropdown({ scenarios, onSelect }: { scenarios: ScenarioConfig[]; onSelect: (sc: ScenarioConfig) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground border border-foreground/[0.1] hover:border-foreground/[0.2] px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        <span>Scenarios</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 border border-[#E5E2DC] rounded-xl bg-white overflow-hidden shadow-lg z-50">
          <p className="px-4 pt-3 pb-2 text-[11px] text-muted">
            Guided multi-step sessions on a specific topic.
          </p>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => { setOpen(false); onSelect(sc); }}
              className="flex items-start gap-3 w-full px-4 py-3 hover:bg-[#F5F3F0] transition text-left cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{sc.title}</p>
                <p className="text-xs text-[#999] mt-0.5 leading-snug">{sc.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatContent() {
  const params = useParams();
  const mentorSlug = params.mentor as string;
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");
  const isInvited = inviteCode ? VALID_INVITE_CODES.has(inviteCode) : false;
  const { data: session, status } = useSession();
  const { triggerConversationRefresh, setActiveConversationId } = useAppShell();

  const [mentorConfig, setMentorConfig] = useState<MentorConfig | null>(null);
  const [mentorResolve, setMentorResolve] = useState<MentorResolveState>("pending");
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [hitPaywall, setHitPaywall] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [gateRemaining, setGateRemaining] = useState<number | null>(null);
  const [gateEmail, setGateEmail] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [gateCodeSent, setGateCodeSent] = useState(false);
  const [gateSending, setGateSending] = useState(false);
  const [gateError, setGateError] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [starters, setStarters] = useState<string[]>([]);
  const [startersReady, setStartersReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(!!searchParams.get("conv"));
  const summaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const artifactsRef = useRef<Artifact[]>([]);

  const tokenBuffer = useTokenBuffer((content) => {
    const artifacts = [...artifactsRef.current];
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { role: "assistant", content, artifacts };
      return copy;
    });
  });

  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isLocked = !isInvited && !isSubscribed && userMessageCount >= FREE_MESSAGE_LIMIT;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!mentorSlug) {
      setMentorResolve("missing");
      setMentorConfig(null);
      setScenarios([]);
      return;
    }
    setMentorResolve("pending");
    setMentorConfig(null);
    setScenarios([]);
    const ac = new AbortController();
    fetch(`/api/mentors/${mentorSlug}`, { signal: ac.signal })
      .then(async (r) => {
        if (r.status === 404 || r.status === 400) {
          setMentorResolve("missing");
          return;
        }
        if (!r.ok) {
          setMentorResolve("missing");
          return;
        }
        const data = await r.json();
        if (data?.mentor) {
          setMentorConfig(data.mentor);
          if (data.scenarios) setScenarios(data.scenarios);
          setMentorResolve("ok");
        } else {
          setMentorResolve("missing");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMentorResolve("missing");
      });
    return () => ac.abort();
  }, [mentorSlug]);

  const userEmail = session?.user?.email;
  const subscribedParam = searchParams.get("subscribed");
  const newParam = searchParams.get("new");
  const scenarioParam = searchParams.get("scenario");
  const convParam = searchParams.get("conv");
  const qParam = searchParams.get("q");

  // Single source of truth for starters — waits for auth to resolve
  useEffect(() => {
    if (status === "loading" || !mentorSlug) return;
    const controller = new AbortController();
    fetch(`/api/starters?mentor=${mentorSlug}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.starters?.length >= 3) setStarters(data.starters);
      })
      .catch(() => {})
      .finally(() => setStartersReady(true));
    return () => controller.abort();
  }, [status, mentorSlug]);

  useEffect(() => {
    if (subscribedParam === "true") {
      setShowWelcome(true);
      setIsSubscribed(true);
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      window.history.replaceState({}, "", `/chat/${mentorSlug}`);
      return () => clearTimeout(timer);
    }
  }, [subscribedParam, mentorSlug]);

  useEffect(() => {
    if (isInvited) return;
    fetch("/api/gate-check")
      .then((r) => r.json())
      .then((data) => {
        if (data.gate === "login") {
          setShowLoginGate(true);
          window.posthog?.capture("gate_hit", { mentor: mentorSlug, trigger: "preemptive" });
        } else if (data.gate === "paywall") {
          setHitPaywall(true);
          window.posthog?.capture("paywall_hit", { mentor: mentorSlug, trigger: "preemptive" });
        }
        if (data.remaining !== null) {
          setGateRemaining(data.remaining);
        }
      })
      .catch(() => {});
  }, [isInvited, userEmail, mentorSlug]);

  useEffect(() => {
    if (!userEmail || !mentorSlug) return;
    fetch(`/api/insights?mentor=${mentorSlug}`)
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
  }, [userEmail, mentorSlug]);

  useEffect(() => {
    if (newParam === "true") {
      setConversationId(null);
      setMessages([]);
      setSummary(null);
      setActiveScenario(null);
      if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
      window.history.replaceState({}, "", `/chat/${mentorSlug}`);
    }
  }, [newParam, mentorSlug]);

  useEffect(() => {
    if (!scenarioParam || !userEmail || scenarios.length === 0) return;
    const scenario = scenarios.find((s) => s.id === scenarioParam);
    if (scenario && messages.length === 0) {
      setActiveScenario(scenario.id);
      setMessages([{ role: "assistant", content: scenario.questions[0] }]);
      window.history.replaceState({}, "", `/chat/${mentorSlug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioParam, userEmail, scenarios]);

  useEffect(() => {
    if (!convParam || !userEmail) return;
    setConversationId(convParam);
    setLoadingConversation(true);
    fetch(`/api/conversations/${convParam}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.messages?.length) {
          setMessages(data.messages.map((m: { role: string; content: string }) => {
            if (m.role === "assistant") {
              const extracted = extractArtifacts(m.content);
              return {
                role: m.role as "user" | "assistant",
                content: extracted.content,
                artifacts: extracted.artifacts.length > 0 ? extracted.artifacts : undefined,
              };
            }
            return { role: m.role as "user" | "assistant", content: m.content };
          }));
        }
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoadingConversation(false));
    window.history.replaceState({}, "", `/chat/${mentorSlug}`);
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
        body: JSON.stringify({ mentor_slug: mentorSlug, ...(scenarioType ? { scenario_type: scenarioType } : {}) }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.id);
        triggerConversationRefresh();
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
          mentor: mentorSlug,
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
        window.posthog?.capture("gate_hit", { mentor: mentorSlug, trigger: "message_blocked" });
        return;
      }

      if (res.status === 402) {
        setHitPaywall(true);
        setMessages((prev) => prev.slice(0, -2));
        setStreaming(false);
        window.posthog?.capture("paywall_hit", { mentor: mentorSlug, trigger: "message_blocked" });
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
      let ndjsonBuffer = "";
      tokenBuffer.reset();
      artifactsRef.current = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const { events, remaining } = parseStreamChunk(raw, ndjsonBuffer);
        ndjsonBuffer = remaining;

        for (const event of events) {
          if (event.type === "text") {
            tokenBuffer.push(event.content);
            setStatusText(null);
          } else if (event.type === "artifact") {
            artifactsRef.current.push(event.artifact);
            setStatusText(null);
          } else if (event.type === "status") {
            setStatusText(event.message);
          } else if (event.type === "error") {
            tokenBuffer.push(`\n[Error: ${event.message}]`);
          }
        }
      }

      const finalContent = tokenBuffer.flush();
      const finalArtifacts = [...artifactsRef.current];
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: finalContent, artifacts: finalArtifacts };
        return copy;
      });
      setStatusText(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setStreaming(false);
      scheduleSummary(convId);
      if (!isInvited) {
        fetch("/api/gate-check")
          .then((r) => r.json())
          .then((data) => {
            if (data.gate === "login" && !showLoginGate) {
              setShowLoginGate(true);
              window.posthog?.capture("gate_hit", { mentor: mentorSlug, trigger: "recheck" });
            } else if (data.gate === "paywall" && !hitPaywall) {
              setHitPaywall(true);
              window.posthog?.capture("paywall_hit", { mentor: mentorSlug, trigger: "recheck" });
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
      const currentUserMsgCount = messages.filter((m) => m.role === "user").length + 1;
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

  if (mentorResolve === "missing") {
    return <MentorChatComingSoon slug={mentorSlug} />;
  }

  if (status === "loading" || mentorResolve === "pending") {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  if (!mentorConfig) {
    return <MentorChatComingSoon slug={mentorSlug} />;
  }

  const mc = mentorConfig;

  return (
    <div className="flex flex-col h-full px-4 py-3" style={{ background: "#F7F5F2" }}>
      <div className="flex-1 flex justify-center min-h-0">
        <div className="w-full max-w-5xl bg-white flex flex-col overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.06)] border border-foreground/[0.08] rounded-2xl h-full">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-foreground/[0.08]">
            <img src={safeAvatar(mc.avatar_url)} alt={mc.name} width={36} height={36} className="rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }} />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm">{mc.name}</h1>
              <p className="text-xs text-muted">{mc.tagline}</p>
            </div>
            {scenarios.length > 0 && (
              <ScenariosDropdown scenarios={scenarios} onSelect={(sc) => {
                if (messages.length > 0 && !confirm("Start a new scenario? This will begin a fresh conversation.")) return;
                setConversationId(null);
                setSummary(null);
                if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
                setActiveScenario(sc.id);
                setMessages([{ role: "assistant", content: sc.questions[0] }]);
                triggerConversationRefresh();
              }} />
            )}
          </div>

          {showWelcome && (
            <div className="mx-6 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">You&apos;re in.</p>
                  <p className="text-xs text-muted mt-0.5">Unlimited access to {mc.name}. Your conversations are saved. Ask anything.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-muted hover:text-foreground text-xs ml-4 cursor-pointer">&#x2715;</button>
              </div>
            </div>
          )}

          {showBanner && <MemoryBanner />}

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {summary && messages.length > 0 && (
              <div className="bg-[#F5F3F0] border border-foreground/[0.06] rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Session Summary</p>
                <div className="text-sm text-foreground/70 whitespace-pre-line">{summary}</div>
              </div>
            )}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-[#F5F3F0] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                {mc.welcome_message}
              </div>
            </div>

            {loadingConversation && (
              <div className="flex justify-center pt-8">
                <div className="flex items-center gap-2 text-muted text-sm">
                  <div className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                  Loading conversation...
                </div>
              </div>
            )}

            {!loadingConversation && messages.length === 0 && !startersReady && (
              <div className="flex justify-center pt-8">
                <div className="flex items-center gap-2 text-muted text-sm">
                  <div className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                  {status === "authenticated" ? "Loading customized starter prompts..." : "Loading starter prompts..."}
                </div>
              </div>
            )}

            {!loadingConversation && messages.length === 0 && starters.length > 0 && startersReady && (
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
            )}


            {messages.map((m, i) => {
              const context = m.role === "assistant" && i > 0
                ? messages.slice(0, i).reverse().find((prev) => prev.role === "user")?.content
                : undefined;
              return (
                <ChatMessage
                  key={i}
                  role={m.role}
                  content={m.content}
                  mentorSlug={mentorSlug}
                  isSubscribed={isSubscribed}
                  context={context}
                  isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                  statusText={streaming && i === messages.length - 1 && m.role === "assistant" && statusText ? statusText : undefined}
                  artifacts={m.artifacts}
                />
              );
            })}

            <div ref={bottomRef} />
          </div>

          {showLoginGate ? (
            <div className="px-6 py-6">
              <div className="max-w-sm mx-auto rounded-2xl border border-[#E5E2DC] p-8 text-center" style={{ background: "#FAFAF8", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <p className="text-sm text-[#1A1A1A] mb-1 font-medium">Thanks for trying ForgeHouse</p>
                <p className="text-xs text-[#737373] mb-4">Sign in to get {mc.name}&apos;s answer and keep the conversation going.</p>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <a href={`/sign-in?callbackUrl=/chat/${mentorSlug}`} className="bg-[#0A66C2] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#004182] transition text-center">Continue with LinkedIn</a>
                  <a href={`/sign-in?callbackUrl=/chat/${mentorSlug}`} className="bg-white text-[#1A1A1A] border border-[#DDD] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition text-center">Continue with Google</a>
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
                          const res = await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: gateEmail }) });
                          if (res.ok) { setGateCodeSent(true); } else { const data = await res.json(); setGateError(data.error || "Failed to send code"); }
                        } catch { setGateError("Failed to send code"); }
                        setGateSending(false);
                      }} className="space-y-2">
                        <input type="email" placeholder="Enter your email" value={gateEmail} onChange={(e) => setGateEmail(e.target.value)} required className="w-full bg-white border border-[#DDD] text-[#1A1A1A] px-4 py-3 rounded-xl text-sm placeholder:text-[#999] focus:outline-none focus:border-amber" />
                        <button type="submit" disabled={gateSending} className="w-full bg-white text-[#1A1A1A] border border-[#DDD] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition disabled:opacity-50">{gateSending ? "Sending..." : "Continue with Email"}</button>
                        {gateError && <p className="text-red-500 text-xs text-center">{gateError}</p>}
                      </form>
                    ) : (
                      <form onSubmit={async (e) => { e.preventDefault(); setGateError(""); const res = await signIn("credentials", { email: gateEmail, code: gateCode, redirect: false }); if (res?.error) { setGateError("Invalid or expired code. Try again."); } else if (res?.ok) { window.location.href = `/chat/${mentorSlug}`; } }} className="space-y-2">
                        <p className="text-muted text-xs text-center">Code sent to <span className="text-foreground">{gateEmail}</span></p>
                        <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Enter 6-digit code" value={gateCode} onChange={(e) => setGateCode(e.target.value.replace(/\D/g, ""))} required className="w-full bg-white/[0.03] border border-white/[0.08] text-foreground px-4 py-3 rounded-xl text-sm placeholder:text-muted focus:outline-none focus:border-white/[0.2] text-center tracking-[0.3em] text-lg" />
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
                <p className="text-sm text-foreground/90 mb-1 font-medium">You&apos;ve used your {FREE_MESSAGE_LIMIT} free messages.</p>
                <p className="text-xs text-muted mb-4">Subscribe to keep talking to {mc.name} and save your conversations.</p>
                <UpgradePrompt
                  mentorSlug={mentorSlug}
                  mentorName={mc.name}
                  mentorMonthlyPriceCents={mc.monthly_price}
                />
              </div>
            </div>
          ) : (
            <div className="border-t border-foreground/[0.08] px-6 py-4">
              <div className="flex gap-3">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your situation..." rows={1} className="flex-1 bg-transparent border border-foreground/[0.12] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-[#B8916A]/40 transition resize-none" />
                <button onClick={() => send()} disabled={streaming} className="bg-[#B8916A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#A07B56] transition disabled:opacity-50">Send</button>
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

export default function DynamicMentorChat() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
