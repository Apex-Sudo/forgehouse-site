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
      <span className="inline-block w-1.5 h-4 bg-amber/70 rounded-sm animate-pulse ml-0.5 align-text-bottom" />
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
        className={saved ? "text-amber" : "text-muted hover:text-foreground"}
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
        <div className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-[#B8916A] text-white rounded-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start group">
      <div className="max-w-[80%]">
        <div className="px-4 py-3 text-sm leading-relaxed bg-[#F5F3F0] text-foreground rounded-2xl prose-chat">
          {isStreaming && !content ? (
            <div className="flex items-center gap-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8916A] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8916A] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8916A] animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="text-muted text-xs">{statusText ?? "Thinking..."}</span>
            </div>
          ) : isStreaming ? (
            <StreamingText content={content} />
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                ul: ({ children }) => <ul className="mb-3 last:mb-0 space-y-1.5 list-none">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal list-inside">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-amber mt-0.5 shrink-0">▸</span>
                    <span>{children}</span>
                  </li>
                ),
                code: ({ children }) => (
                  <code className="bg-foreground/[0.06] px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                ),
                h1: ({ children }) => <h3 className="font-bold text-foreground mb-2 text-base">{children}</h3>,
                h2: ({ children }) => <h3 className="font-bold text-foreground mb-2 text-base">{children}</h3>,
                h3: ({ children }) => <h3 className="font-semibold text-foreground mb-1.5 text-sm">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber/40 pl-3 my-2 text-muted italic">{children}</blockquote>
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
