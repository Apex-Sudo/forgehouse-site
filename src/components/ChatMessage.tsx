"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  mentorSlug?: string;
  isSubscribed?: boolean;
  context?: string; // the user message that prompted this response
}

function BookmarkButton({
  content,
  mentorSlug,
  isSubscribed,
  context,
}: {
  content: string;
  mentorSlug: string;
  isSubscribed: boolean;
  context?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentor_slug: mentorSlug, content, context }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.code === "INSIGHT_LIMIT") {
          alert("Free users can save up to 3 insights. Subscribe for unlimited.");
        }
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={save}
      title={saved ? "Saved" : "Save insight"}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-1 shrink-0 cursor-pointer"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={saved ? "text-amber" : "text-muted hover:text-foreground"}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

export default function ChatMessage({ role, content, mentorSlug, isSubscribed: isSubProp, context }: ChatMessageProps) {
  const { data: session } = useSession();

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-[#B8916A] text-white rounded-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start group">
      <div className="max-w-[80%] px-4 py-3 text-sm leading-relaxed bg-white/[0.04] border border-white/[0.06] text-foreground rounded-2xl prose-chat">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            em: ({ children }) => <em className="italic text-white/80">{children}</em>,
            ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 list-none">{children}</ul>,
            ol: ({ children }) => <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal list-inside">{children}</ol>,
            li: ({ children }) => (
              <li className="flex items-start gap-2">
                <span className="text-amber mt-0.5 shrink-0">▸</span>
                <span>{children}</span>
              </li>
            ),
            code: ({ children }) => (
              <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ),
            h1: ({ children }) => <h3 className="font-bold text-white mb-2 text-base">{children}</h3>,
            h2: ({ children }) => <h3 className="font-bold text-white mb-2 text-base">{children}</h3>,
            h3: ({ children }) => <h3 className="font-semibold text-white mb-1.5 text-sm">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-amber/40 pl-3 my-2 text-muted italic">{children}</blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {session && mentorSlug && (
        <BookmarkButton
          content={content}
          mentorSlug={mentorSlug}
          isSubscribed={isSubProp ?? false}
          context={context}
        />
      )}
    </div>
  );
}
