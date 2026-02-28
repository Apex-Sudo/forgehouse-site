"use client";
import { useState, useEffect, useRef } from "react";

interface Conversation {
  id: string;
  created_at: string;
  messages?: { role: string; content: string }[];
  summary?: string | null;
}

interface Props {
  mentorSlug: string;
  onSelect: (id: string, messages: { role: "user" | "assistant"; content: string }[], summary?: string | null) => void;
  onNew: () => void;
}

export default function ConversationHistory({ mentorSlug, onSelect, onNew }: Props) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch(`/api/conversations?mentor=${mentorSlug}`);
      if (res.ok) {
        const data = await res.json();
        // Load messages for each to get preview
        const withMessages = await Promise.all(
          data.map(async (c: Conversation) => {
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
        setConversations(withMessages);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const toggle = () => {
    if (!open) load();
    setOpen(!open);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPreview = (c: Conversation) => {
    if (c.summary) {
      // Show first line of summary
      const firstLine = c.summary.split("\n").find((l) => l.trim()) ?? "";
      return firstLine.length > 60 ? firstLine.slice(0, 60) + "..." : firstLine;
    }
    const first = c.messages?.find((m) => m.role === "user");
    if (!first) return "Empty conversation";
    return first.content.length > 60 ? first.content.slice(0, 60) + "..." : first.content;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        className="text-muted hover:text-foreground transition p-1.5 rounded-lg hover:bg-white/[0.04]"
        title="Conversation history"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-background border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">History</span>
            <button
              onClick={() => { setOpen(false); onNew(); }}
              className="text-xs text-amber hover:text-amber-dark transition"
            >
              + New
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading && <div className="px-3 py-4 text-xs text-muted text-center">Loading...</div>}
            {!loading && conversations.length === 0 && (
              <div className="px-3 py-4 text-xs text-muted text-center">No conversations yet</div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setOpen(false);
                  const msgs = (c.messages || []) as { role: "user" | "assistant"; content: string }[];
                  onSelect(c.id, msgs, c.summary);
                }}
                className="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition border-b border-white/[0.04] last:border-0"
              >
                <div className="text-xs text-muted">{formatDate(c.created_at)}</div>
                <div className="text-sm text-foreground/80 truncate">{getPreview(c)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
