"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAppShell } from "./AppShellContext";
import { SCENARIOS } from "@/lib/scenarios";
import {
  IconBookmark,
  IconChevronDown,
  IconPlus,
  IconTarget,
  IconTriangle,
  IconCreditCard,
  IconUser,
  IconUserCircle,
  IconLogout,
  IconArrowUp,
  IconSearch,
  IconMail,
  IconCheck,
} from "@tabler/icons-react";

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  search: <IconSearch size={16} />,
  mail: <IconMail size={16} />,
  target: <IconTarget size={16} />,
};

interface Conversation {
  id: string;
  mentor_slug: string;
  created_at: string;
  messages?: { role: string; content: string }[];
  summary?: string | null;
}

interface InsightCount {
  total: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen, refreshConversations } = useAppShell();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [insightCount, setInsightCount] = useState<InsightCount>({ total: 0 });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [convsExpanded, setConvsExpanded] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  // Load conversations for all mentors
  useEffect(() => {
    if (!session?.user) return;
    const load = async () => {
      setLoadingConvos(true);
      try {
        const [colinRes, apexRes] = await Promise.all([
          fetch("/api/conversations?mentor=colin-chapman"),
          fetch("/api/conversations?mentor=apex"),
        ]);
        const colinData = colinRes.ok ? await colinRes.json() : [];
        const apexData = apexRes.ok ? await apexRes.json() : [];

        // Merge and sort by date
        const all = [
          ...colinData.map((c: Conversation) => ({ ...c, mentor_slug: "colin-chapman" })),
          ...apexData.map((c: Conversation) => ({ ...c, mentor_slug: "apex" })),
        ].sort((a: Conversation, b: Conversation) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Load previews for recent ones (top 10)
        const withPreviews = await Promise.all(
          all.slice(0, 10).map(async (c: Conversation) => {
            try {
              const r = await fetch(`/api/conversations/${c.id}`);
              if (r.ok) {
                const full = await r.json();
                return { ...c, messages: full.messages, summary: full.summary ?? null };
              }
            } catch { /* ignore */ }
            return c;
          })
        );
        setConversations([...withPreviews, ...all.slice(10)]);
      } catch { /* ignore */ }
      setLoadingConvos(false);
    };
    load();
  }, [session, refreshConversations]);

  // Check profile status
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/profile")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setProfileComplete(data.profile?.profile_complete ?? false);
        }
      })
      .catch(() => {});
  }, [session]);

  // Load insight count
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/insights?mentor=colin-chapman")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setInsightCount({ total: (data.insights || []).length });
          setIsSubscribed(data.isSubscribed);
        }
      })
      .catch(() => {});
  }, [session]);

  const getPreview = (c: Conversation) => {
    if (c.summary) {
      const line = c.summary.split("\n").find((l) => l.trim()) ?? "";
      return line.length > 50 ? line.slice(0, 50) + "..." : line;
    }
    const first = c.messages?.find((m) => m.role === "user");
    if (!first) return "New conversation";
    return first.content.length > 50 ? first.content.slice(0, 50) + "..." : first.content;
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const mentorIcon = (slug: string) => slug === "colin-chapman"
    ? <IconTarget size={14} className="text-amber" />
    : <IconTriangle size={14} className="text-amber" />;
  const mentorName = (slug: string) => slug === "colin-chapman" ? "Colin" : "Apex";

  const isActive = (path: string) => pathname === path;

  const navLink = (href: string, onClick?: () => void) => {
    const handleClick = () => {
      setSidebarOpen(false);
      onClick?.();
    };
    return { href, onClick: handleClick };
  };

  const groupedConvos = conversations.reduce<Record<string, Conversation[]>>((acc, c) => {
    const key = c.mentor_slug;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-background border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        {/* Spacer to align with navbar */}
        <div className="h-3" />

        <div className="flex-1 overflow-y-auto">
          {/* Mentors */}
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs text-muted/60 uppercase tracking-wider font-medium px-2 mb-2">Mentors</p>
            <Link
              {...navLink("/chat/colin-chapman")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                isActive("/chat/colin-chapman")
                  ? "bg-amber/10 text-foreground border border-amber/20"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              <Image
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                width={28}
                height={28}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium">Colin Chapman</span>
                <p className="text-xs text-muted truncate">GTM & Outbound</p>
              </div>
            </Link>
            <Link
              {...navLink("/chat/apex")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm mt-1 ${
                isActive("/chat/apex")
                  ? "bg-amber/10 text-foreground border border-amber/20"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              <span className="w-7 h-7 flex items-center justify-center"><IconTriangle size={18} className="text-red-500 fill-red-500" /></span>
              <div className="flex-1 min-w-0">
                <span className="font-medium">Apex</span>
                <span className="ml-1.5 text-[10px] bg-white/[0.06] text-muted px-1.5 py-0.5 rounded-full">free</span>
                <p className="text-xs text-muted truncate">Decision partner</p>
              </div>
            </Link>
          </div>

          {/* Profile Setup */}
          {profileComplete !== null && (
            <div className="px-3 pt-2 pb-2">
              <Link
                {...navLink("/chat/onboarding")}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition text-sm ${
                  isActive("/chat/onboarding")
                    ? "bg-amber/10 text-foreground border border-amber/20"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconUserCircle size={16} />
                  <span>{profileComplete ? "Your Profile" : "Set up your profile"}</span>
                </div>
                {profileComplete ? (
                  <IconCheck size={14} className="text-green-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                )}
              </Link>
            </div>
          )}

          {/* Conversations */}
          <div className="px-3 pt-2 pb-2">
            <button
              onClick={() => setConvsExpanded(!convsExpanded)}
              className="w-full flex items-center justify-between px-2 mb-2 cursor-pointer"
            >
              <p className="text-xs text-muted/60 uppercase tracking-wider font-medium">Conversations</p>
              <IconChevronDown size={12} className={`text-muted/40 transition-transform ${convsExpanded ? "rotate-180" : ""}`} />
            </button>
            {convsExpanded && (
              <div className="space-y-0.5">
                {loadingConvos && (
                  <p className="px-3 py-2 text-xs text-muted animate-pulse">Loading...</p>
                )}
                {Object.entries(groupedConvos).map(([slug, convos]) => (
                  <div key={slug}>
                    {convos.slice(0, 5).map((c) => (
                      <Link
                        key={c.id}
                        {...navLink(`/chat/${c.mentor_slug}?conv=${c.id}`)}
                        className="block px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-white/[0.04] rounded-lg transition truncate"
                      >
                        <span className="text-muted/40 mr-1">{formatDate(c.created_at)}</span>
                        {getPreview(c)}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Insights */}
          <div className="px-3 pt-2 pb-2">
            <Link
              {...navLink("/insights")}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition text-sm ${
                isActive("/insights")
                  ? "bg-amber/10 text-foreground border border-amber/20"
                  : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2">
                <IconBookmark size={16} />
                <span>Saved Insights</span>
              </div>
              {insightCount.total > 0 && (
                <span className="text-[10px] bg-amber/20 text-amber px-1.5 py-0.5 rounded-full font-medium">
                  {insightCount.total}
                </span>
              )}
            </Link>
          </div>

          {/* Scenarios */}
          <div className="px-3 pt-2 pb-2">
            <p className="text-xs text-muted/60 uppercase tracking-wider font-medium px-2 mb-2">Scenarios</p>
            {SCENARIOS.map((sc) => (
              <Link
                key={sc.id}
                {...navLink(`/chat/colin-chapman?scenario=${sc.id}`)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-white/[0.04] rounded-lg transition"
              >
                <span className="text-muted">{SCENARIO_ICONS[sc.icon] ?? sc.icon}</span>
                <span className="text-xs">{sc.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div className="border-t border-white/[0.06] px-3 py-3">
          <Link {...navLink("/account")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-semibold shrink-0">
                {session?.user?.name?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-[11px] text-muted">
                {isSubscribed ? "Subscribed" : "Free tier"}
              </p>
            </div>
          </Link>
          <div className="flex items-center px-3 mt-1">
            {isSubscribed ? (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className="text-[11px] text-muted hover:text-foreground transition cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/[0.04]"
              >
                <IconCreditCard size={13} /> Billing
              </button>
            ) : (
              <Link href="/pricing" className="text-[11px] text-amber hover:text-amber-dark transition flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/[0.04]">
                <IconArrowUp size={13} /> Upgrade
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-[11px] text-muted hover:text-foreground transition cursor-pointer flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/[0.04] ml-auto"
            >
              <IconLogout size={13} /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
