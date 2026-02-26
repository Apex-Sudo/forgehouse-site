"use client";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-[#3B82F6] text-white rounded-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
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
    </div>
  );
}
