"use client";
import Link from "next/link";
import InlineChat, { STARTERS } from "@/components/InlineChat";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    router.push(`/chat/colin-chapman?q=${encodeURIComponent(text.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero: Centered input, ChatGPT/Gemini style */}
      <section className="px-6 min-h-[85vh] flex items-center justify-center">
        <div className="max-w-[720px] w-full mx-auto text-center">
          {/* Avatar + Greeting */}
          <div className="flex flex-col items-center mb-8">
            {/* AI Sparkle Icon */}
            <div className="mb-6">
              <IconSparkles size={56} className="text-amber" stroke={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[#1A1A1A] mb-2">
              Talk to a sales expert. <span className="text-amber">Right now.</span>
            </h1>
          </div>

          {/* Input Box */}
          <div className="mb-6">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask Colin about sales..."
                className="w-full px-6 py-4 text-[16px] rounded-2xl border border-[#E5E2DC] focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition resize-none bg-white text-[#1A1A1A] placeholder:text-[#999]"
                style={{ minHeight: '60px' }}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber text-white w-10 h-10 rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
              >
                →
              </button>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleSubmit("My cold emails aren't getting replies")}
              className="px-5 py-2.5 rounded-full border border-[#E5E2DC] bg-white text-[#555] text-[14px] hover:border-amber hover:text-amber transition"
            >
              My cold emails aren&apos;t getting replies
            </button>
            <button
              onClick={() => handleSubmit("I built the product but don't know how to sell it")}
              className="px-5 py-2.5 rounded-full border border-[#E5E2DC] bg-white text-[#555] text-[14px] hover:border-amber hover:text-amber transition"
            >
              I built the product but don&apos;t know how to sell it
            </button>
          </div>
        </div>
      </section>

      {/* What ForgeHouse does */}
      <section className="px-6 py-32" style={{ background: "#1A1A1A" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-6">What ForgeHouse is</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-white leading-[1.1]">Expert knowledge,<br /><span className="text-amber">on demand.</span></h2>
          <p className="text-[#999] text-[17px] md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            Real conversations with domain experts, turned into AI mentors. Not scraped content. <span className="font-bold text-white">Real frameworks from real practitioners.</span> First up: <Link href="/mentors/colin-chapman" className="text-amber hover:text-[#c9a87c] transition font-semibold">Colin Chapman</Link>, 26 years in B2B sales. More domains coming soon.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Value Props */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl md:text-6xl font-bold text-amber mb-3">24/7</p>
            <p className="text-[#737373] text-[16px]">Available when you need it. Not next Thursday on a Calendly link.</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-amber mb-3">2 min</p>
            <p className="text-[#737373] text-[16px]">Average time to actionable advice. No onboarding, no context-setting.</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-amber mb-3">26 yrs</p>
            <p className="text-[#737373] text-[16px]">Of B2B sales expertise distilled into every response.</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Who this is for */}
      <section className="px-6 py-12" style={{ background: "#1A1A1A" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-3">Who this is for</p>
          <p className="text-[#999] text-lg leading-relaxed">
            <span className="font-semibold text-white">Founders doing sales alone.</span> Side projects going to market. <span className="font-semibold text-white">Teams without a sales hire.</span>
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest text-center mb-12">How it works</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Ask a question", desc: "Type what you're stuck on. Sales, outbound, pipeline, positioning." },
              { num: "02", title: "Get expert advice", desc: "From real frameworks, not generic AI. Built on decades of practitioner experience." },
              { num: "03", title: "Save & apply", desc: "Your conversation history and insights are saved automatically. Pick up where you left off." },
            ].map((step) => (
              <div key={step.num} className="text-center p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber/[0.08]">
                <span className="text-amber font-mono text-sm font-bold">{step.num}</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] mt-3 mb-3">{step.title}</h3>
                <p className="text-[#737373] text-[15px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the mentors */}
      <section className="px-6 py-28" style={{ background: "#FAFAF8" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-3">Meet the Mentors</h2>
          <p className="text-[15px] text-[#737373] text-center mb-4">Real expertise, available as AI agents. Built from hours of real mentoring sessions.</p>
          <div className="w-10 h-1 bg-amber mx-auto rounded-full mb-14"></div>

          {/* Pricing-style 3-card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Ghost card 1 - left */}
            <div className="hidden md:flex flex-col items-center rounded-2xl border border-dashed border-[#E0DDD8] bg-white/60 p-10 text-center opacity-50">
              <div className="w-20 h-20 rounded-full bg-[#F0EDE8] mb-5 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#C5C0B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className="text-lg font-bold text-[#C5C0B8] mb-1">Coming Soon</p>
              <p className="text-sm text-[#C5C0B8] mb-4">New domain expert</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
              </div>
              <Link href="/for-mentors" className="text-sm text-amber hover:text-[#c9a87c] transition font-medium">Apply to mentor →</Link>
            </div>

            {/* Colin - featured center card */}
            <Link href="/mentors/colin-chapman" className="group flex flex-col items-center rounded-2xl border-2 border-amber/30 bg-white p-10 text-center shadow-sm hover:shadow-md hover:border-amber/50 transition relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Available Now</span>
              <Image
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                width={80}
                height={80}
                className="rounded-full object-cover group-hover:opacity-90 transition mb-5"
              />
              <p className="text-xl font-bold text-[#1A1A1A] mb-0.5">Colin Chapman</p>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-3">B2B Sales & GTM</p>
              <p className="text-sm text-[#666] leading-relaxed mb-4">Helps first-time founders build repeatable sales processes from zero.</p>
              <p className="text-[12px] text-[#999] mb-5">26 yrs · IBM, Siemens, BMW · 4.92★ GrowthMentor</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Cold Outreach</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Discovery Calls</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Pipeline</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Objection Handling</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E2DC] text-[#666] font-medium">Founder-Led Sales</span>
              </div>
              <span className="inline-block bg-amber text-white px-6 py-2.5 rounded-xl text-sm font-semibold group-hover:opacity-90 transition w-full">Talk to Colin →</span>
            </Link>

            {/* Ghost card 2 - right */}
            <div className="hidden md:flex flex-col items-center rounded-2xl border border-dashed border-[#E0DDD8] bg-white/60 p-10 text-center opacity-50">
              <div className="w-20 h-20 rounded-full bg-[#F0EDE8] mb-5 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#C5C0B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p className="text-lg font-bold text-[#C5C0B8] mb-1">Coming Soon</p>
              <p className="text-sm text-[#C5C0B8] mb-4">New domain expert</p>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#F5F3EF] text-[#C5C0B8]">???</span>
              </div>
              <Link href="/for-mentors" className="text-sm text-amber hover:text-[#c9a87c] transition font-medium">Apply to mentor →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* Data bar */}
      <section className="px-6 py-6" style={{ background: "#1A1A1A" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#999] text-xs md:text-sm whitespace-nowrap">
            70% of founders under 30 prefer text over calls · 9 out of 10 won&apos;t book a meeting to get help · <span className="text-white font-semibold">We built for that.</span>
          </p>
        </div>
      </section>

    </div>
  );
}
