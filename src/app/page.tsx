"use client";
import Link from "next/link";
import InlineChat, { STARTERS } from "@/components/InlineChat";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
            <Link href="/mentors/colin-chapman">
              <Image
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                width={80}
                height={80}
                className="rounded-full object-cover mb-6 hover:opacity-80 transition cursor-pointer"
              />
            </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-[#1A1A1A] mb-2">
              What's your <span className="text-amber">toughest</span> sales challenge?
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

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-3 justify-center">
            {STARTERS.slice(0, 3).map((starter) => (
              <button
                key={starter}
                onClick={() => handleSubmit(starter)}
                className="px-5 py-2.5 rounded-full border border-[#E5E2DC] bg-white text-[#555] text-[14px] hover:border-amber hover:text-amber transition"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* What ForgeHouse does */}
      <section className="px-6 py-32" style={{ background: "#FAFAF8" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1A1A1A]">Real mentors. Not a chatbot.</h2>
          <p className="text-[#737373] text-[16px] md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Colin Chapman has spent 26 years closing B2B deals, training sales teams, and building outbound systems for companies like IBM, Siemens, and BMW. He&apos;s a 4.92-rated mentor on GrowthMentor. We <span className="font-bold">turned his expertise into an AI mentor</span> you can talk to anytime, or plug directly into your workflow.
          </p>
          <Link href="/mentors/colin-chapman" className="text-amber text-[15px] hover:text-[#A07D5A] transition">
            Learn more about Colin &rarr;
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Testimonials */}
      <section className="px-6 py-36">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-amber/[0.15] p-10 md:p-12 text-center" style={{ background: "#FAFAF8" }}>
            <p className="text-lg md:text-xl text-[#1A1A1A]/80 leading-relaxed italic mb-8">&ldquo;I just add it and boom, my agent has the sales stuff. It&apos;s a <span className="font-bold not-italic text-[#1A1A1A]">shortcut to knowledge</span> I&apos;d spend months acquiring. Everyone is trying to reduce work, and this does exactly that.&rdquo;</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-amber text-white flex items-center justify-center font-bold text-sm">R</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A1A]">Richard Okonicha</p>
                <p className="text-xs text-[#737373]">Founder, Fugoku</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Free Tools - pain point framing */}
      <section className="px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-amber uppercase tracking-widest text-center mb-3">Free tools</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Doing sales alone is hard. These help.</h2>
          <p className="text-muted text-center text-[16px] mb-16 max-w-xl mx-auto">Free tools built on 26 years of B2B sales experience. Get clarity in under 3 minutes.</p>
          <div className="space-y-10">
            {[
              { title: "ICP Diagnostic", pain: "Not sure who your ideal customer is?", desc: "Define your ideal customer profile in 60 seconds using the Jobs-to-be-Done framework. Stop guessing who to sell to.", href: "/tools/icp-diagnostic", time: "60 sec" },
              { title: "Cold Email Teardown", pain: "Cold emails getting ignored?", desc: "Paste your cold email. Get it torn apart line by line and rewritten using Colin's Problem-Impact-Proof framework.", href: "/tools/cold-email-teardown", time: "30 sec" },
              { title: "Pipeline Diagnosis", pain: "Deals stalling and you don't know why?", desc: "Describe your last 3 lost deals. Find the pattern killing your pipeline and the one fix that saves the most revenue.", href: "/tools/pipeline-diagnosis", time: "3 min" },
              { title: "Outbound Week Planner", pain: "No structure in your outbound?", desc: "Get a concrete Mon-Fri outbound plan with daily tasks, email templates, and targets. Built for founder-led sales.", href: "/tools/outbound-planner", time: "60 sec" },
            ].map((tool, i) => (
              <Link key={tool.href} href={tool.href} className={`glass-card p-8 md:p-10 flex flex-col hover:border-amber/20 transition group max-w-3xl mx-auto`}>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber uppercase tracking-wider mb-2">{tool.title}</p>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{tool.pain}</h3>
                  <p className="text-muted text-[15px] leading-relaxed mb-3">{tool.desc}</p>
                  <span className="text-xs text-muted/60">{tool.time} · No signup needed</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* CTA */}
      <section className="px-6 py-32" style={{ background: "#FAFAF8" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1A1A1A]">Ask Colin anything about sales.</h2>
          <p className="text-[#737373] text-lg mb-8 max-w-xl mx-auto">
            No scheduling, no hourly rates. 5 free messages to try it. Your conversation history and insights are saved automatically.
          </p>
          <Link href="/chat/colin-chapman" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Colin — free to try →
          </Link>
          <p className="text-[#737373]/50 text-sm mt-6">
            Already using AI tools? <Link href="/account" className="text-amber hover:text-[#A07D5A] transition">Add Colin via API →</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
