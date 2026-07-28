"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import ChatMessage from "@/components/ChatMessage";
import MemoryBanner from "@/components/MemoryBanner";
import UpgradePrompt from "@/components/UpgradePrompt";
import PromptLibraryButton from "@/components/PromptLibraryButton";
import PromptLibraryBottomSheet from "@/components/PromptLibraryBottomSheet";
import MobileMenu from "@/components/MobileMenu";
import { parseStreamChunk, extractArtifacts, type Artifact } from "@/lib/agent/helper/stream";
import { useTokenBuffer } from "@/hooks/useTokenBuffer";
import { useAppShell } from "@/components/AppShellContext";
import { getExpertProfile } from "@/lib/expert-profile";

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
    <div className="flex flex-col h-full items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg px-8 py-10 text-center">
        <p className="mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">ForgeHouse chat</p>
        <h1 className="text-[40px] leading-none text-foreground mb-3">Coming soon</h1>
        <p className="text-[16px] text-muted leading-relaxed mb-1">
          We don&apos;t have an active mentor chat for <span className="text-accent italic">{slug}</span> yet.
        </p>
        <p className="text-[16px] text-muted leading-relaxed mb-8">
          Check back later or pick someone who&apos;s live today.
        </p>
        <Link
          href="/mentors"
          className="mono inline-flex items-center justify-center rounded-md border border-accent/70 px-5 py-3 text-[12px] tracking-[0.06em] uppercase text-accent hover:bg-accent hover:text-[#1B1B18] transition"
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
        className="mono flex items-center gap-1.5 text-[11px] tracking-[0.06em] uppercase text-muted hover:text-accent border border-border hover:border-accent/60 px-3 py-1.5 rounded-md transition cursor-pointer"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        <span>Scenarios</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 border border-border rounded-md bg-surface overflow-hidden shadow-2xl z-50">
          <p className="mono px-4 pt-3 pb-2 text-[10px] tracking-[0.06em] uppercase text-faint">
            Guided multi-step sessions on a specific topic.
          </p>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => { setOpen(false); onSelect(sc); }}
              className="flex items-start gap-3 w-full px-4 py-3 hover:bg-surface-light transition text-left cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-[17px] leading-tight text-foreground">{sc.title}</p>
                <p className="text-[14px] italic text-muted mt-0.5 leading-snug">{sc.description}</p>
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
  const [promptSheetOpen, setPromptSheetOpen] = useState(false);
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
    // Check gate with mentorSlug for per-mentor subscription check
    fetch(`/api/gate-check?mentor=${mentorSlug}`)
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
    if (!userEmail || !session?.user?.id || !mentorSlug) return;
    // Check general insights
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
    
    // Also check direct mentor subscription
    fetch(`/api/subscription-status?mentor=${mentorSlug}`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          if (data.isSubscribed) {
            setIsSubscribed(true);
            setShowBanner(false);
          }
        }
      })
      .catch(() => {});
  }, [userEmail, mentorSlug, session?.user?.id]);

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
        fetch(`/api/gate-check?mentor=${mentorSlug}`)
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
      <div className="flex flex-col h-full items-center justify-center bg-background">
        <span className="mono animate-pulse text-muted text-[11px] tracking-[0.1em] uppercase">Loading...</span>
      </div>
    );
  }

  if (!mentorConfig) {
    return <MentorChatComingSoon slug={mentorSlug} />;
  }

  const mc = mentorConfig;
  const expert = getExpertProfile(mentorSlug, mc.tagline);

  return (
    <div className="flex flex-col h-full bg-background px-5 py-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col h-full min-h-0 gap-4">
        {/* Eyebrow */}
        <div className="flex justify-end shrink-0">
          <span className="mono text-[12px] tracking-[0.1em] uppercase text-muted">Trained Experts</span>
        </div>

        <MobileMenu
          onPromptClick={() => setPromptSheetOpen(true)}
          scenarios={scenarios}
          onScenarioSelect={(sc) => {
            if (messages.length > 0 && !confirm("Start a new scenario? This will begin a fresh conversation.")) return;
            setConversationId(null);
            setSummary(null);
            if (summaryTimerRef.current) clearTimeout(summaryTimerRef.current);
            setActiveScenario(sc.id);
            setMessages([{ role: "assistant", content: sc.questions[0] }]);
            triggerConversationRefresh();
          }}
        >
          {/* Expert header card */}
          <div className="bg-surface border border-accent/60 rounded-lg px-7 py-6 flex items-start gap-5 shrink-0">
            <img src={safeAvatar(mc.avatar_url)} alt={mc.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover shrink-0 mt-1" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }} />
            <div className="flex-1 min-w-0">
              <h1 className="text-[40px] leading-[0.95] uppercase text-foreground break-words">{mc.name}</h1>
              <p className="text-[22px] italic leading-tight text-accent mt-1.5">{expert.specialty}</p>
            </div>

            <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
              {expert.highlights.length > 0 && (
                <ul className="mono text-[11px] leading-[1.75] text-muted text-right">
                  {expert.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                <PromptLibraryButton onClick={() => setPromptSheetOpen(true)} />
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
            </div>
          </div>
        </MobileMenu>

        {showWelcome && (
          <div className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="bg-surface border border-accent/40 rounded-md px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[19px] leading-none text-accent">You&apos;re in.</p>
                <p className="mono text-[11px] tracking-[0.02em] text-muted mt-1.5">Unlimited access to {mc.name}. Your conversations are saved. Ask anything.</p>
              </div>
              <button onClick={() => setShowWelcome(false)} className="text-muted hover:text-accent text-xs ml-4 cursor-pointer">&#x2715;</button>
            </div>
          </div>
        )}

        {showBanner && <div className="shrink-0"><MemoryBanner /></div>}

        {/* Message panel */}
        <div className="flex-1 min-h-0 overflow-y-auto fh-scroll bg-surface rounded-lg px-7 py-7 space-y-6">
          {summary && messages.length > 0 && (
            <div className="bg-background border border-border rounded-md px-4 py-3 mb-2">
              <p className="mono text-[10px] text-muted uppercase tracking-[0.1em] mb-2">Session Summary</p>
              <div className="text-[15px] text-muted whitespace-pre-line">{summary}</div>
            </div>
          )}
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-accent text-[#1B1B18] px-5 py-3.5 text-[15px] leading-relaxed rounded-lg rounded-bl-sm">
              {mc.welcome_message}
            </div>
          </div>

          {loadingConversation && (
            <div className="flex justify-center pt-8">
              <div className="mono flex items-center gap-2 text-muted text-[11px] tracking-[0.06em] uppercase">
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Loading conversation...
              </div>
            </div>
          )}

          {!loadingConversation && messages.length === 0 && !startersReady && (
            <div className="flex justify-center pt-8">
              <div className="mono flex items-center gap-2 text-muted text-[11px] tracking-[0.06em] uppercase">
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
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
                  className="text-[15px] bg-transparent border border-border px-4 py-2 rounded-md text-muted hover:text-accent hover:border-accent/60 transition cursor-pointer"
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
          <div className="shrink-0 py-4">
            <div className="max-w-sm mx-auto rounded-lg border border-border bg-surface p-8 text-center">
              <p className="text-[22px] leading-none text-foreground mb-2">Thanks for trying ForgeHouse</p>
              <p className="mono text-[11px] leading-relaxed tracking-[0.02em] text-muted mb-5">Sign in to get {mc.name}&apos;s answer and keep the conversation going.</p>
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <a href={`/sign-in?callbackUrl=/chat/${mentorSlug}`} className="mono bg-[#0A66C2] text-white px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-[#004182] transition text-center">Continue with LinkedIn</a>
                <a href={`/sign-in?callbackUrl=/chat/${mentorSlug}`} className="mono bg-transparent text-foreground border border-border px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:border-accent/60 hover:text-accent transition text-center">Continue with Google</a>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="mono text-faint text-[10px] uppercase tracking-[0.1em]">or</span>
                    <div className="flex-1 h-px bg-border" />
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
                      <input type="email" placeholder="Enter your email" value={gateEmail} onChange={(e) => setGateEmail(e.target.value)} required className="w-full bg-background border border-border text-foreground px-4 py-3 rounded-md text-[15px] placeholder:text-faint focus:outline-none focus:border-accent/60" />
                      <button type="submit" disabled={gateSending} className="mono w-full bg-transparent text-accent border border-accent/70 px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-50 cursor-pointer">{gateSending ? "Sending..." : "Continue with Email"}</button>
                      {gateError && <p className="mono text-red-400 text-[11px] text-center">{gateError}</p>}
                    </form>
                  ) : (
                    <form onSubmit={async (e) => { e.preventDefault(); setGateError(""); const res = await signIn("credentials", { email: gateEmail, code: gateCode, redirect: false }); if (res?.error) { setGateError("Invalid or expired code. Try again."); } else if (res?.ok) { window.location.href = `/chat/${mentorSlug}`; } }} className="space-y-2">
                      <p className="mono text-muted text-[11px] text-center">Code sent to <span className="text-accent">{gateEmail}</span></p>
                      <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="Enter 6-digit code" value={gateCode} onChange={(e) => setGateCode(e.target.value.replace(/\D/g, ""))} required className="mono w-full bg-background border border-border text-foreground px-4 py-3 rounded-md text-[15px] placeholder:text-faint focus:outline-none focus:border-accent/60 text-center tracking-[0.3em]" />
                      <button type="submit" className="mono w-full bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-accent-dim transition cursor-pointer">Verify &amp; Sign In</button>
                      <button type="button" onClick={() => { setGateCodeSent(false); setGateCode(""); setGateError(""); }} className="mono w-full text-muted text-[10px] uppercase tracking-[0.06em] hover:text-accent transition cursor-pointer">Use a different email</button>
                      {gateError && <p className="mono text-red-400 text-[11px] text-center">{gateError}</p>}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isLocked || hitPaywall ? (
          <div className="shrink-0 pt-2">
            <div className="text-center">
              <p className="text-[22px] leading-none text-foreground mb-2">You&apos;ve used your {FREE_MESSAGE_LIMIT} free messages.</p>
              <p className="mono text-[11px] tracking-[0.02em] text-muted">Subscribe to keep talking to {mc.name} and save your conversations.</p>
              <UpgradePrompt
                mentorSlug={mentorSlug}
                mentorName={mc.name}
                mentorMonthlyPriceCents={mc.monthly_price}
              />
            </div>
          </div>
        ) : (
          <div className="shrink-0">
            <div className="flex gap-3">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your situation..." rows={1} className="flex-1 bg-surface border border-border rounded-md px-5 py-3.5 text-[15px] text-foreground placeholder:text-faint focus:outline-none focus:border-accent/50 transition resize-none" />
              <button onClick={() => send()} disabled={streaming} className="mono shrink-0 bg-transparent text-accent border border-accent/70 px-7 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 cursor-pointer">Send</button>
            </div>
            <p className="mono text-[10px] tracking-[0.04em] text-faint text-center mt-2.5">Your conversations are private. We don&apos;t sell or share your data.</p>
            {!isInvited && !isSubscribed && userMessageCount >= 3 && (
              <p className="mono text-[10px] tracking-[0.04em] text-muted text-center mt-1.5">
                {FREE_MESSAGE_LIMIT - userMessageCount} free message{FREE_MESSAGE_LIMIT - userMessageCount !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        )}
      </div>

      <PromptLibraryBottomSheet
        open={promptSheetOpen}
        onClose={() => setPromptSheetOpen(false)}
        onSelect={(promptText) => {
          setInput(promptText);
          setPromptSheetOpen(false);
        }}
      />
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
