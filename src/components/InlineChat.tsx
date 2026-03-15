"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const STARTERS = [
  "My cold emails aren't getting replies",
  "I built the product but don't know how to sell it",
  "How do I build an outbound process from scratch?",
];

const COLIN_MESSAGE =
  "Hey, I'm an AI agent based on Colin Chapman and his 26 years in GTM and outbound sales. What are you working on? Tell me about your product and who you're trying to reach, and I'll help you figure out how to get in front of them.";

export default function InlineChat() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [showStarters, setShowStarters] = useState(false);

  // Typing animation for Colin's message
  useEffect(() => {
    let i = 0;
    const speed = 18; // ms per character
    const timer = setInterval(() => {
      i++;
      setDisplayedText(COLIN_MESSAGE.slice(0, i));
      if (i >= COLIN_MESSAGE.length) {
        clearInterval(timer);
        setTimeout(() => setShowStarters(true), 300);
      }
    }, speed);
    return () => clearInterval(timer);
  }, []);

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
    <div
      className="max-w-[840px] mx-auto min-h-[540px] flex flex-col overflow-hidden rounded-[20px]"
      style={{
        background: "#FAFAF8",
        border: "1px solid rgba(184, 145, 106, 0.25)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3.5 px-8 py-6" style={{ borderBottom: "1px solid #E5E2DC" }}>
        <Link href="/mentors/colin-chapman" className="shrink-0">
          <Image
            src="/mentors/colin-chapman.png"
            alt="Colin Chapman"
            width={44}
            height={44}
            className="rounded-xl object-cover hover:opacity-80 transition"
          />
        </Link>
        <div>
          <Link href="/mentors/colin-chapman" className="hover:text-amber transition">
            <p className="text-[16px] font-semibold text-[#1A1A1A]">Colin Chapman</p>
          </Link>
          <p className="text-[11px] text-[#888] uppercase tracking-wider">
            GTM & Outbound Sales · 26 years
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Colin intro + starters */}
        <div className="p-8 pb-4 space-y-4">
          <div className="max-w-[85%]">
            <div className="rounded-[14px] rounded-bl-sm px-5 py-3.5 text-[15px] text-[#1A1A1A]/80 leading-relaxed" style={{ background: "#F0EDE8" }}>
              {displayedText}
              {displayedText.length < COLIN_MESSAGE.length && (
                <span className="inline-block w-[2px] h-[1em] bg-[#1A1A1A]/60 ml-0.5 align-middle animate-pulse" />
              )}
            </div>
            {displayedText.length >= COLIN_MESSAGE.length && (
              <p className="text-[11px] text-[#999] mt-1.5 ml-1">Just now</p>
            )}
          </div>
          <div
            className={`flex flex-col gap-2 mt-2 transition-all duration-500 ${
              showStarters
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                className="text-[13px] text-[#555] border border-[#DDD] px-5 py-3 rounded-[10px] hover:border-amber hover:text-amber transition cursor-pointer"
                style={{ background: "white" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mt-auto px-8 pb-6 pt-4" style={{ borderTop: "1px solid #E5E2DC" }}>
          <div className="flex gap-2.5">
            <div
              className="flex-1 relative border border-[#DDD] rounded-[10px] px-[18px] py-3 cursor-text focus-within:border-amber transition"
              style={{ background: "white" }}
              onClick={() => document.getElementById("inline-chat-input")?.focus()}
            >
              {!input && (
                <span className="absolute inset-0 flex items-center px-[18px] pointer-events-none">
                  <span className="text-[15px] text-[#999]">Or type your own question</span>
                  <span className="inline-block w-[2px] h-[18px] bg-amber ml-0.5 animate-[blink_1s_step-end_infinite]" />
                </span>
              )}
              <textarea
                id="inline-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full bg-transparent text-[15px] text-[#1A1A1A] focus:outline-none resize-none caret-amber placeholder:text-transparent"
                placeholder="Or type your own question"
              />
            </div>
            <button
              onClick={() => go(input)}
              disabled={!input.trim()}
              className="bg-amber text-white w-11 h-11 font-bold text-lg rounded-[10px] hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export { STARTERS };
