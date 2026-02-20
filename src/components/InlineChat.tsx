"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STARTERS = [
  "I can't decide between two go-to-market approaches",
  "My cofounder and I can't agree on pricing",
  "We have traction but no idea what's actually driving it",
  "Should I raise or keep bootstrapping?",
];

export default function InlineChat() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const go = (text: string) => {
    if (!text.trim()) return;
    router.push(`/chat/apex?q=${encodeURIComponent(text.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      go(input);
    }
  };

  return (
    <div className="glass-card max-w-3xl mx-auto min-h-[280px] flex flex-col overflow-hidden shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
      {/* macOS window chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-6 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28C840] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#28C840]"></span>
            </span>
            <span className="text-xs text-muted">Live -- try it now</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                className="text-sm bg-white/[0.04] text-[#EDEDED] border border-white/[0.08] px-4 py-2 rounded-full hover:bg-white/[0.08] hover:border-white/[0.12] transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto px-6 pb-6 pt-3">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or ask your own question..."
              rows={1}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#EDEDED] placeholder:text-[#737373] focus:outline-none focus:border-[#3B82F6]/40 transition resize-none"
            />
            <button
              onClick={() => go(input)}
              disabled={!input.trim()}
              className="bg-[#3B82F6] text-white px-6 py-3 font-semibold text-sm rounded-xl hover:bg-[#2563EB] transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { STARTERS };
