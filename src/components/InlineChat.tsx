"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STARTERS = [
  "My cold emails aren't getting replies",
  "I built the product but don't know how to sell it",
  "How do I build an outbound process from scratch?",
];

export default function InlineChat() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const go = (text: string) => {
    if (!text.trim()) return;
    router.push(`/chat/colin-chapman?q=${encodeURIComponent(text.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      go(input);
    }
  };

  return (
    <div className="glass-card max-w-[840px] mx-auto min-h-[380px] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(184,145,106,0.04)] border-amber/[0.12]"
      style={{ borderRadius: "20px" }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-8 py-6 border-b border-amber/[0.08]">
        <div className="w-11 h-11 rounded-xl bg-amber text-background flex items-center justify-center font-bold text-[17px]">C</div>
        <div>
          <p className="text-[16px] font-semibold">Colin Chapman</p>
          <p className="text-[11px] text-muted uppercase tracking-wider">GTM & Outbound Sales · 26 years</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Colin intro + starters */}
        <div className="p-8 pb-4 space-y-4">
          <div className="max-w-[85%]">
            <div className="bg-white/[0.06] rounded-[14px] rounded-bl-sm px-5 py-3.5 text-[15px] text-foreground/80 leading-relaxed">
              Hey, I&apos;m Colin. I&apos;ve spent 26 years in GTM and outbound sales. What are you working on? Tell me about your product and who you&apos;re trying to reach, and I&apos;ll help you figure out how to get in front of them.
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                className="text-[13px] bg-white/[0.02] text-foreground/70 border border-amber/[0.08] px-5 py-3 rounded-[10px] hover:border-amber/[0.24] hover:text-amber transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mt-auto px-8 pb-6 pt-4 border-t border-amber/[0.08]">
          <div className="flex gap-2.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Or type your own question..."
              rows={1}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-[10px] px-[18px] py-3 text-[15px] text-foreground placeholder:text-muted focus:outline-none focus:border-amber/40 transition resize-none"
            />
            <button
              onClick={() => go(input)}
              disabled={!input.trim()}
              className="bg-amber text-background w-11 h-11 font-bold text-lg rounded-[10px] hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { STARTERS };
