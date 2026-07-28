"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAppShell } from "./AppShellContext";
import Wordmark from "@/components/brand/Wordmark";
import { getExpertProfile } from "@/lib/expert-profile";
import {
  IconBookmark,
  IconChevronDown,
  IconUser,
  IconDotsVertical,
  IconTrash,
  IconPencil,
  IconMessage,
} from "@tabler/icons-react";

const FALLBACK_AVATAR = "/mentors/default-avatar.svg";
function safeAvatar(url: string | undefined | null): string {
  if (!url || url.includes("default-avatar.png")) return FALLBACK_AVATAR;
  return url;
}

interface MentorListItem {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  monthly_price: number;
}

interface Conversation {
  id: string;
  mentor_slug: string;
  created_at: string;
  updated_at?: string;
  messages?: { role: string; content: string }[];
  summary?: string | null;
}

interface InsightCount {
  total: number;
}

/** Small lime bullet used on the account links in the footer of the rail. */
function Bullet() {
  return <span className="text-accent text-[9px] leading-none shrink-0">&#9679;</span>;
}

function ConversationRow({
  conv,
  mentor,
  isActive,
  onNavigate,
  onDelete,
  onRename,
}: {
  conv: Conversation;
  mentor?: MentorListItem;
  isActive: boolean;
  onNavigate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const cleanText = (raw: string) => {
    return raw.replace(/^[\s\-–—•*#]+/, "").trim();
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getTitle = () => {
    if (conv.summary) {
      const line = conv.summary.split("\n").find((l) => l.trim()) ?? "";
      const cleaned = cleanText(line);
      const title = cleaned.length > 50 ? cleaned.slice(0, 50) + "…" : cleaned;
      return capitalize(title);
    }
    const first = conv.messages?.find((m) => m.role === "user");
    if (!first) return "New conversation";
    const cleaned = cleanText(first.content);
    const title = cleaned.length > 50 ? cleaned.slice(0, 50) + "…" : cleaned;
    return capitalize(title);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const profile = getExpertProfile(conv.mentor_slug, mentor?.tagline);

  return (
    <div className="relative group">
      <Link
        href={`/chat/${conv.mentor_slug}?conv=${conv.id}`}
        onClick={onNavigate}
        title={getTitle()}
        className={`flex items-start gap-3 px-3 py-2.5 rounded-md transition ${
          isActive ? "bg-surface" : "hover:bg-surface/70"
        }`}
      >
        <img
          src={safeAvatar(mentor?.avatar_url)}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
        />
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[18px] leading-[1.15] text-foreground truncate">
            {mentor?.name ?? "Trained Expert"}
          </p>
          <p className="text-[14px] italic leading-[1.25] text-accent truncate">
            {profile.specialty}
          </p>
          <p className="mono text-[10px] text-faint truncate mt-1">
            {getTitle()} &middot; {formatDate(conv.created_at)}
          </p>
        </div>
      </Link>

      <div ref={menuRef} className="absolute right-1.5 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-0.5 rounded bg-surface-light border border-border hover:border-border-light transition cursor-pointer"
        >
          <IconDotsVertical size={13} className="text-muted" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 bg-surface border border-border rounded-md shadow-2xl py-1 z-50 w-36">
            <button
              onClick={() => { setMenuOpen(false); onRename(conv.id, getTitle()); }}
              className="mono flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-muted hover:text-foreground hover:bg-surface-light transition cursor-pointer"
            >
              <IconPencil size={13} />
              Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(conv.id); }}
              className="mono flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-surface-light transition cursor-pointer"
            >
              <IconTrash size={13} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen, refreshConversations, activeConversationId } = useAppShell();
  const [mentors, setMentors] = useState<MentorListItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [insightCount, setInsightCount] = useState<InsightCount>({ total: 0 });
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [mentorsExpanded, setMentorsExpanded] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const userEmail = session?.user?.email;

  const activeMentorSlug = pathname?.match(/^\/chat\/([a-z0-9-]+)/)?.[1] ?? null;

  useEffect(() => {
    fetch("/api/mentors")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.mentors) setMentors(data.mentors);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userEmail || mentors.length === 0) return;
    const load = async () => {
      setLoadingConvos(true);
      try {
        const allConvos: Conversation[] = [];
        for (const m of mentors) {
          const res = await fetch(`/api/conversations?mentor=${m.slug}`);
          if (res.ok) {
            const data = await res.json();
            allConvos.push(...data.map((c: Conversation) => ({ ...c, mentor_slug: m.slug })));
          }
        }
        allConvos.sort((a, b) => {
          const aTime = new Date(a.updated_at ?? a.created_at).getTime();
          const bTime = new Date(b.updated_at ?? b.created_at).getTime();
          return bTime - aTime;
        });

        const withPreviews = await Promise.all(
          allConvos.slice(0, 10).map(async (c) => {
            try {
              const r = await fetch(`/api/conversations/${c.id}`);
              if (r.ok) {
                const full = await r.json();
                return { ...c, messages: full.messages, summary: full.summary ?? null };
              }
            } catch (err) { console.error("[Sidebar] preview fetch failed:", err); }
            return c;
          })
        );
        setConversations([...withPreviews, ...allConvos.slice(10)]);
      } catch (err) { console.error("[Sidebar] conversation load failed:", err); }
      setLoadingConvos(false);
    };
    load();
  }, [userEmail, refreshConversations, mentors]);

  useEffect(() => {
    if (!userEmail) return;
    fetch("/api/profile")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setProfileComplete(data.profile?.profile_complete ?? false);
        }
      })
      .catch(() => {});
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail || !activeMentorSlug) return;
    fetch(`/api/insights?mentor=${activeMentorSlug}`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setInsightCount({ total: (data.insights || []).length });
        }
      })
      .catch(() => {});
  }, [userEmail, activeMentorSlug]);

  const mentorsBySlug = Object.fromEntries(mentors.map((m) => [m.slug, m]));

  const isActivePath = (path: string) => pathname === path;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch { /* ignore */ }
  };

  const handleRenameStart = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const handleRenameSubmit = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${renamingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => c.id === renamingId ? { ...c, summary: renameValue.trim() } : c)
        );
      }
    } catch { /* ignore */ }
    setRenamingId(null);
  };

  const accountLinkClass =
    "flex items-center gap-2 px-1 py-1 text-[12px] italic text-muted hover:text-accent transition text-left";

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-[290px] bg-background border-r border-border z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        {/* Wordmark lockup */}
        <div className="px-5 pt-6 pb-5 shrink-0 text-foreground">
          <Wordmark size={22} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Chat — expert dropdown */}
          <div className="px-4 pb-3 shrink-0">
            <button
              onClick={() => setMentorsExpanded(!mentorsExpanded)}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-md border border-border text-[19px] leading-none text-foreground hover:border-accent/50 hover:bg-surface transition cursor-pointer"
            >
              <span>
                Select an <span className="uppercase">Expert</span>
              </span>
              <IconChevronDown
                size={16}
                className={`text-muted transition-transform ${mentorsExpanded ? "rotate-180" : ""}`}
              />
            </button>
            {mentorsExpanded && (
              <div className="mt-1.5 border border-border rounded-md bg-surface overflow-hidden">
                {mentors.map((m) => {
                  const profile = getExpertProfile(m.slug, m.tagline);
                  return (
                    <div key={m.slug} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-light transition">
                      <img
                        src={safeAvatar(m.avatar_url)}
                        alt={m.name}
                        width={30}
                        height={30}
                        className="w-[30px] h-[30px] rounded-full object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] leading-tight text-foreground truncate">{m.name}</p>
                        <p className="text-[13px] italic text-accent truncate leading-tight">{profile.specialty}</p>
                      </div>
                      <Link
                        href={`/chat/${m.slug}?new=true`}
                        onClick={() => { setMentorsExpanded(false); setSidebarOpen(false); }}
                        className="mono shrink-0 flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-accent hover:text-[#1B1B18] hover:bg-accent border border-accent/60 px-2 py-1 rounded transition"
                      >
                        <IconMessage size={11} />
                        Chat
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile setup — only shown when incomplete */}
          {profileComplete === false && (
            <div className="px-4 pb-3 shrink-0">
              <Link
                href="/chat/onboarding"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md transition text-[17px] ${
                  isActivePath("/chat/onboarding")
                    ? "text-accent"
                    : "text-foreground hover:text-accent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <IconUser size={17} stroke={1.4} className="text-muted shrink-0" />
                  Set up your Profile
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </Link>
            </div>
          )}

          <div className="px-4 flex-1 min-h-0 flex flex-col">
            <p className="px-2 mb-2 shrink-0 text-[19px] leading-none text-muted">Conversations</p>

            <div className="space-y-1 flex-1 overflow-y-auto min-h-0 fh-scroll -mx-1 px-1">
              {loadingConvos && (
                <div className="space-y-1.5 px-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-surface-light animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-surface-light rounded animate-pulse w-3/4" />
                        <div className="h-2 bg-surface rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {renamingId && (
                <div className="px-1 py-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={handleRenameSubmit}
                    className="w-full bg-surface border border-accent/40 rounded-md px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              )}

              {conversations.slice(0, 15).map((c) => {
                if (c.id === renamingId) return null;
                const mentor = mentorsBySlug[c.mentor_slug];
                return (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    mentor={mentor}
                    isActive={activeConversationId === c.id}
                    onNavigate={() => setSidebarOpen(false)}
                    onDelete={handleDelete}
                    onRename={handleRenameStart}
                  />
                );
              })}

              {!loadingConvos && conversations.length === 0 && (
                <p className="mono px-2 py-2 text-[11px] tracking-[0.04em] text-faint">No conversations yet</p>
              )}
            </div>
          </div>

          <div className="px-4 pt-3 pb-2 shrink-0">
            <Link
              href="/insights"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md transition text-[17px] ${
                isActivePath("/insights")
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <IconBookmark size={16} stroke={1.4} className="text-muted shrink-0" />
                Saved Insights
              </span>
              {insightCount.total > 0 && (
                <span className="mono text-[10px] text-accent border border-accent/50 px-1.5 py-px rounded-full">
                  {insightCount.total}
                </span>
              )}
            </Link>
          </div>
        </div>

        {session?.user && (
          <div className="shrink-0 border-t border-border px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={26}
                  height={26}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-[26px] h-[26px] rounded-full bg-surface-light flex items-center justify-center mono text-[11px] text-accent shrink-0">
                  {session.user.name?.[0] ?? "?"}
                </div>
              )}
              <span className="text-[20px] leading-none text-foreground truncate">
                {session.user.name?.split(" ")[0]}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <Link href="/account" onClick={() => setSidebarOpen(false)} className={accountLinkClass}>
                <Bullet />
                Account
              </Link>
              <Link href="/pricing" onClick={() => setSidebarOpen(false)} className={accountLinkClass}>
                <Bullet />
                Pricing
              </Link>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className={`${accountLinkClass} w-full cursor-pointer`}
              >
                <Bullet />
                Billing
              </button>
              <button
                onClick={() => signOut()}
                className={`${accountLinkClass} w-full cursor-pointer`}
              >
                <Bullet />
                Sign out
              </button>
            </div>
          </div>
        )}

      </aside>
    </>
  );
}
