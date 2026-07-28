"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import type { Artifact } from "@/lib/agent/helper/stream";
import ArtifactCard from "./ArtifactCard";

function StreamingText({ content }: { content: string }) {
  const shownLenRef = useRef(0);

  const already = content.slice(0, shownLenRef.current);
  const fresh = content.slice(shownLenRef.current);

  useEffect(() => {
    shownLenRef.current = content.length;
  });

  return (
    <div className="whitespace-pre-wrap">
      {already}
      <span key={content.length} className="stream-fade">{fresh}</span>
      <span className="inline-block w-1.5 h-4 bg-[#1B1B18]/60 rounded-sm animate-pulse ml-0.5 align-text-bottom" />
    </div>
  );
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  mentorSlug?: string;
  isSubscribed?: boolean;
  context?: string;
  isStreaming?: boolean;
  statusText?: string;
  artifacts?: Artifact[];
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
        className={saved ? "text-accent" : "text-muted hover:text-accent"}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

const ChatMessage = React.memo(function ChatMessage({ role, content, mentorSlug, isSubscribed: isSubProp, context, isStreaming, statusText, artifacts }: ChatMessageProps) {
  const { data: session } = useSession();

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-right border border-border text-foreground rounded-lg rounded-br-sm">
          {content}
        </div>
      </div>
    );
  }

  // Typing indicator lives outside the lime bubble so the dots read on the panel.
  if (isStreaming && !content) {
    return (
      <div className="flex justify-start items-center gap-3">
        <span className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:200ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent fh-dot [animation-delay:400ms]" />
        </span>
        <span className="mono text-[11px] tracking-[0.06em] uppercase text-muted">
          {statusText ?? "Thinking..."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-start group">
      <div className="max-w-[75%]">
        <div className="px-5 py-3.5 text-[15px] leading-relaxed bg-accent text-[#1B1B18] rounded-lg rounded-bl-sm prose-chat">
          {isStreaming ? (
            <StreamingText content={content} />
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#1B1B18]">{children}</strong>,
                em: ({ children }) => <em className="italic text-[#1B1B18]/80">{children}</em>,
                ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 list-none">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal list-inside">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B1B18]/55 mt-0.5 shrink-0">▸</span>
                    <span>{children}</span>
                  </li>
                ),
                code: ({ children }) => (
                  <code className="bg-[#1B1B18]/10 text-[#1B1B18] px-1.5 py-0.5 rounded text-[13px] mono">{children}</code>
                ),
                h1: ({ children }) => <h3 className="text-[#1B1B18] mb-2 text-[19px]">{children}</h3>,
                h2: ({ children }) => <h3 className="text-[#1B1B18] mb-2 text-[19px]">{children}</h3>,
                h3: ({ children }) => <h3 className="text-[#1B1B18] mb-1.5 text-[17px]">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#1B1B18]/30 pl-3 my-2 text-[#1B1B18]/70 italic">{children}</blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
        {artifacts && artifacts.length > 0 && (
          <div className="mt-1">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        )}
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
});

export default ChatMessage;
