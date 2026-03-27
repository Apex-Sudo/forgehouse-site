"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

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
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="pt-4 h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Saved Insights</h1>
            <p className="text-sm text-muted mt-1">
              {insights.length} insight{insights.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insights..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-amber/40 transition"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="animate-pulse text-muted text-sm">Loading insights...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-muted/30 mb-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-muted text-sm">
              {search
                ? "No insights match your search."
                : "No saved insights yet. Bookmark advice from your mentors to build your playbook."}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([slug, items]) => {
            const mentor = mentors[slug];
            return (
              <div key={slug} className="mb-8">
                <h2 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4">
                  {mentor?.avatar_url ? (
                    <img src={mentor.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <span>💬</span>
                  )}
                  {mentor?.name ?? slug}
                </h2>
                <div className="space-y-3">
                  {items.map((insight) => (
                    <div
                      key={insight.id}
                      className="glass-card px-5 py-4 group/item"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {insight.context && (
                            <p className="text-xs text-muted/60 mb-2 italic truncate">
                              You asked: {insight.context.length > 100 ? insight.context.slice(0, 100) + "..." : insight.context}
                            </p>
                          )}
                          <div className="text-sm text-foreground/80 prose-chat">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-1.5 last:mb-0 text-sm">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                ul: ({ children }) => <ul className="space-y-0.5 list-none">{children}</ul>,
                                li: ({ children }) => (
                                  <li className="flex items-start gap-1.5 text-sm">
                                    <span className="text-amber mt-0.5 shrink-0 text-xs">▸</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                              }}
                            >
                              {insight.content}
                            </ReactMarkdown>
                          </div>
                          <p className="text-[10px] text-muted/40 mt-2">
                            {formatDate(insight.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(insight.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-xs text-muted/40 hover:text-red-400 transition cursor-pointer shrink-0 mt-1"
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
