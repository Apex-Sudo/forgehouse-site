"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { IconBookmark, IconSearch } from "@tabler/icons-react";

const FALLBACK_AVATAR = "/mentors/default-avatar.svg";
function safeAvatar(url: string | undefined | null): string {
  if (!url || url.includes("default-avatar.png")) return FALLBACK_AVATAR;
  return url;
}

interface Insight {
  id: string;
  content: string;
  context: string | null;
  mentor_slug: string;
  created_at: string;
}

interface MentorInfo {
  slug: string;
  name: string;
  avatar_url: string;
}

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [mentors, setMentors] = useState<Record<string, MentorInfo>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/mentors")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.mentors) {
          const map: Record<string, MentorInfo> = {};
          for (const m of data.mentors) map[m.slug] = m;
          setMentors(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/sign-in?callbackUrl=/insights";
      return;
    }
    if (!session?.user) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/insights");
        const data = res.ok ? await res.json() : { insights: [] };
        const all = data.insights || [];
        all.sort((a: Insight, b: Insight) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setInsights(all);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [session, status]);

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/insights/${id}`, { method: "DELETE" });
      if (res.ok) setInsights((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = search
    ? insights.filter(
        (i) =>
          i.content.toLowerCase().includes(search.toLowerCase()) ||
          (i.context && i.context.toLowerCase().includes(search.toLowerCase()))
      )
    : insights;

  // Group by mentor
  const grouped = filtered.reduce<Record<string, Insight[]>>((acc, i) => {
    const key = i.mentor_slug || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(i);
    return acc;
  }, {});

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <span className="mono animate-pulse text-muted text-[12px] tracking-[0.04em]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="pt-4 h-full overflow-y-auto bg-background">
      <div className="max-w-[1008px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="mono text-[13px] text-accent mb-4">Your Playbook</p>
            <h1 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.02em]">Saved Insights</h1>
            <p className="mono text-[12px] tracking-[0.04em] text-muted mt-3">
              {insights.length} insight{insights.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <IconSearch
            size={16}
            stroke={1.5}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insights..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2.5 text-[15px] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="mono animate-pulse text-muted text-[12px] tracking-[0.04em]">Loading insights...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <IconBookmark size={40} stroke={1.25} className="mx-auto text-faint mb-5" />
            <p className="text-muted text-[17px] leading-[1.5] max-w-[420px] mx-auto">
              {search
                ? "No insights match your search."
                : "No saved insights yet. Bookmark advice from your mentors to build your playbook."}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([slug, items]) => {
            const mentor = mentors[slug];
            return (
              <div key={slug} className="mb-10">
                <h2 className="mono text-[11px] uppercase tracking-[0.08em] text-faint flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
                  <img src={safeAvatar(mentor?.avatar_url)} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-border" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }} />
                  {mentor?.name ?? slug}
                </h2>
                <div className="space-y-[14px]">
                  {items.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-surface border border-border rounded-lg px-5 py-4 group/item hover:border-border-light transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {insight.context && (
                            <p className="mono text-[11px] tracking-[0.02em] text-faint mb-2.5 truncate">
                              You asked: {insight.context.length > 100 ? insight.context.slice(0, 100) + "..." : insight.context}
                            </p>
                          )}
                          <div className="text-[16px] leading-[1.5] text-foreground/85 prose-chat">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-[16px] leading-[1.5]">{children}</p>,
                                strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                                ul: ({ children }) => <ul className="space-y-1 list-none">{children}</ul>,
                                li: ({ children }) => (
                                  <li className="flex items-start gap-2 text-[16px] leading-[1.5]">
                                    <span className="text-accent mt-0.5 shrink-0 text-[11px]">▸</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                              }}
                            >
                              {insight.content}
                            </ReactMarkdown>
                          </div>
                          <p className="mono text-[10px] tracking-[0.06em] text-faint mt-3">
                            {formatDate(insight.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(insight.id)}
                          className="mono text-[11px] tracking-[0.02em] text-faint opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 hover:text-[#F2777A] transition cursor-pointer shrink-0 mt-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
