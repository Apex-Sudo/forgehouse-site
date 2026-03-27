"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAppShell } from "./AppShellContext";
import {
  IconBookmark,
  IconChevronDown,
  IconPlus,
  IconUserCircle,
  IconDotsVertical,
  IconTrash,
  IconPencil,
  IconMessage,
} from "@tabler/icons-react";

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

  const getTitle = () => {
    if (conv.summary) {
      const line = conv.summary.split("\n").find((l) => l.trim()) ?? "";
      const cleaned = cleanText(line);
      return cleaned.length > 50 ? cleaned.slice(0, 50) + "\u2026" : cleaned;
    }
    const first = conv.messages?.find((m) => m.role === "user");
    if (!first) return "New conversation";
    const cleaned = cleanText(first.content);
    return cleaned.length > 50 ? cleaned.slice(0, 50) + "\u2026" : cleaned;
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative group">
      <Link
        href={`/chat/${conv.mentor_slug}?conv=${conv.id}`}
        onClick={onNavigate}
        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition ${
          isActive
            ? "bg-amber/10 text-foreground border border-amber/20"
            : "text-[#1A1A1A] hover:bg-[#F5F3F0]"
        }`}
      >
        {mentor && (
          <Image src={mentor.avatar_url} alt="" width={22} height={22} className="rounded-full shrink-0" />
        )}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-medium truncate leading-snug">{getTitle()}</p>
          <p className="text-[10px] text-[#999] mt-px">{mentor?.name ? `${mentor.name.split(" ")[0]} \u00b7 ` : ""}{formatDate(conv.created_at)}</p>
        </div>
      </Link>

      <div ref={menuRef} className="absolute right-1.5 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-0.5 rounded bg-white/80 hover:bg-[#E5E2DC] border border-transparent hover:border-[#E5E2DC] transition cursor-pointer shadow-sm"
        >
          <IconDotsVertical size={13} className="text-[#666]" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 bg-white border border-[#E5E2DC] rounded-lg shadow-lg py-1 z-50 w-36">
            <button
              onClick={() => { setMenuOpen(false); onRename(conv.id, getTitle()); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-[#1A1A1A] hover:bg-[#F5F3F0] transition cursor-pointer"
            >
              <IconPencil size={14} />
              Rename
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(conv.id); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <IconTrash size={14} />
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
  const [mentorsExpanded, setMentorsExpanded] = useState(true);
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
            } catch { /* ignore */ }
            return c;
          })
        );
        setConversations([...withPreviews, ...allConvos.slice(10)]);
      } catch { /* ignore */ }
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

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-background border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:z-auto`}
      >
        <div className="h-3" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Chat — mentor dropdown */}
          <div className="px-3 pt-4 pb-2 shrink-0">
            <button
              onClick={() => setMentorsExpanded(!mentorsExpanded)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-amber/10 border border-amber/20 text-sm font-medium text-foreground hover:bg-amber/15 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IconPlus size={15} className="text-amber" />
                <span>New Chat</span>
              </div>
              <IconChevronDown size={14} className={`text-muted transition-transform ${mentorsExpanded ? "rotate-180" : ""}`} />
            </button>
            {mentorsExpanded && (
              <div className="mt-1 border border-[#E5E2DC] rounded-lg bg-white overflow-hidden">
                {mentors.map((m) => (
                  <div key={m.slug} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#F5F3F0] transition">
                    <Image src={m.avatar_url} alt={m.name} width={28} height={28} className="rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1A1A1A] leading-tight">{m.name}</p>
                      <p className="text-[10px] text-[#999] truncate">{m.tagline}</p>
                    </div>
                    <Link
                      href={`/chat/${m.slug}?new=true`}
                      onClick={() => { setMentorsExpanded(false); setSidebarOpen(false); }}
                      className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-amber hover:text-amber-dark px-2 py-1 rounded-md hover:bg-amber/10 transition"
                    >
                      <IconMessage size={12} />
                      Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile setup — only shown when incomplete */}
          {profileComplete === false && (
            <div className="px-3 pt-1 pb-2 shrink-0">
              <Link
                href="/chat/onboarding"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition text-sm ${
                  isActivePath("/chat/onboarding")
                    ? "bg-amber/10 text-foreground border border-amber/20"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconUserCircle size={16} />
                  <span>Set up your profile</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              </Link>
            </div>
          )}

          <div className="px-3 pt-2 pb-2 flex-1 min-h-0 flex flex-col">
            <div className="px-2 mb-2 shrink-0">
              <p className="text-xs text-muted/60 uppercase tracking-wider font-medium">Conversations</p>
            </div>
              <div className="space-y-0.5 flex-1 overflow-y-auto min-h-0">
                {loadingConvos && (
                  <div className="space-y-1 px-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-2">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#E5E2DC] animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-[#E5E2DC] rounded animate-pulse w-3/4" />
                          <div className="h-2 bg-[#EEECE8] rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {renamingId && (
                  <div className="px-2 py-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      onBlur={handleRenameSubmit}
                      className="w-full bg-white border border-amber/30 rounded-lg px-3 py-1.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-amber"
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
                  <p className="px-3 py-2 text-xs text-muted/50">No conversations yet</p>
                )}
              </div>
          </div>

          <div className="px-3 pt-2 pb-2 shrink-0">
            <Link
              href="/insights"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition text-sm ${
                isActivePath("/insights")
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

        </div>

        {session?.user && (
          <div className="shrink-0 border-t border-foreground/[0.06] px-3 py-3">
            <div className="flex items-center gap-2.5 mb-2 px-1">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-foreground/[0.08] flex items-center justify-center text-xs font-semibold shrink-0">
                  {session.user.name?.[0] ?? "?"}
                </div>
              )}
              <span className="text-sm font-medium text-foreground truncate">
                {session.user.name?.split(" ")[0]}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <Link
                href="/account"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] rounded-lg transition"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Account
              </Link>
              <Link
                href="/pricing"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] rounded-lg transition"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
                className="flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] rounded-lg transition cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                Billing
              </button>
              <div className="my-1 border-t border-foreground/[0.06]" />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] rounded-lg transition cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          </div>
        )}

      </aside>
    </>
  );
}
