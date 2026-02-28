"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface Insight {
  id: string;
  content: string;
  context: string | null;
  created_at: string;
}

interface Props {
  mentorSlug: string;
}

export default function SavedInsightsPanel({ mentorSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights?mentor=${mentorSlug}`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
        setIsSubscribed(data.isSubscribed);
        setLimit(data.limit);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const toggle = () => {
    if (!open) load();
    setOpen(!open);
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/insights/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInsights((prev) => prev.filter((i) => i.id !== id));
      }
    } catch { /* ignore */ }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group insights by date
  const grouped = insights.reduce<Record<string, Insight[]>>((acc, ins) => {
    const key = formatDate(ins.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(ins);
    return acc;
  }, {});

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        className="text-muted hover:text-foreground transition p-1.5 rounded-lg hover:bg-white/[0.04]"
        title="Saved insights"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-background border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Saved Insights</span>
            {!isSubscribed && limit !== null && (
              <span className="text-xs text-muted">{insights.length}/{limit} saved</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <div className="px-4 py-6 text-xs text-muted text-center">Loading...</div>}
            {!loading && insights.length === 0 && (
              <div className="px-4 py-6 text-xs text-muted text-center">
                No saved insights yet. Click the bookmark icon on any response to save it.
              </div>
            )}
            {!loading && Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="px-4 py-2 text-xs text-muted/60 font-medium bg-white/[0.02]">{date}</div>
                {items.map((insight) => (
                  <div
                    key={insight.id}
                    className="px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition group/item"
                  >
                    {insight.context && (
                      <div className="text-xs text-muted/60 mb-1.5 italic truncate">
                        You asked: {insight.context.length > 80 ? insight.context.slice(0, 80) + "..." : insight.context}
                      </div>
                    )}
                    <div className="text-sm text-foreground/80 line-clamp-4 prose-chat">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0 text-sm">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="space-y-0.5 list-none">{children}</ul>,
                          li: ({ children }) => (
                            <li className="flex items-start gap-1.5 text-sm">
                              <span className="text-amber mt-0.5 shrink-0 text-xs">▸</span>
                              <span>{children}</span>
                            </li>
                          ),
                        }}
                      >
                        {insight.content.length > 200 ? insight.content.slice(0, 200) + "..." : insight.content}
                      </ReactMarkdown>
                    </div>
                    <button
                      onClick={() => remove(insight.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-xs text-muted/40 hover:text-red-400 mt-1 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
