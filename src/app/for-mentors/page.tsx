"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconMicrophone, IconEyeCheck, IconShare, IconCash, IconCpu, IconCode, IconHeadset, IconReceipt } from "@tabler/icons-react";

// export const metadata moved to layout.tsx (can't use in client component)

const steps = [
  { num: "01", title: "You teach.", desc: "Few conversations, nothing formal. Share how you approach problems, what you've learned. We're listening for your frameworks, not taking notes.", icon: IconMicrophone },
  { num: "02", title: "We translate.", desc: "Your expertise becomes something that scales. We build it, you test it, we refine it until it sounds like you would handle the conversation.", icon: IconCode },
  { num: "03", title: "You scale.", desc: "Founders get your thinking when they need it. You get inquiries from people who've already experienced your approach and want the real thing.", icon: IconShare },
];

function RevenueCalculator() {
  const [price, setPrice] = useState(150);
  const mentorCut = 0.75;
  const scenarios = [
    { count: 10, label: "Starting" },
    { count: 25, label: "Growing" },
    { count: 50, label: "Established" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mentors-card-elevated p-10 flex flex-col items-center gap-4 mb-16 max-w-md mx-auto">
        <label className="mentors-muted text-base">What would you charge per month?</label>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold mentors-muted">$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            className="text-6xl font-bold bg-transparent border-b-3 border-[#B8916A] focus:border-[#B8916A] outline-none w-44 text-center transition"
            style={{ color: "#1A1A1A" }}
          />
          <span className="text-xl mentors-muted">/mo</span>
        </div>
        <p className="text-xs mentors-muted mt-1" style={{ opacity: 0.5 }}>You keep 75%.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 text-center items-end">
        {scenarios.map(({ count, label }, i) => {
          const monthly = Math.round(price * mentorCut * count);
          const isLast = i === 2;
          const isMiddle = i === 1;
          return (
            <div
              key={count}
              className={`mentors-card-elevated text-center transition-all ${
                isLast
                  ? "p-10 border-2 shadow-[0_8px_30px_rgba(184,145,106,0.15)]"
                  : isMiddle
                  ? "p-9"
                  : "p-8 opacity-80"
              }`}
              style={isLast ? { borderColor: "rgba(184, 145, 106, 0.3)" } : undefined}
            >
              <p className="text-xs font-semibold mentors-muted uppercase tracking-widest mb-3" style={{ opacity: 0.5 }}>{label}</p>
              <p className="text-2xl font-bold mentors-accent mb-1">{count}</p>
              <p className="text-sm mentors-muted mb-5">subscribers</p>
              <p className={`font-bold mb-1 ${isLast ? "text-6xl" : isMiddle ? "text-5xl" : "text-4xl"}`} style={{ color: "#1A1A1A" }}>
                ${monthly.toLocaleString()}
              </p>
              <p className="text-sm mentors-muted mt-2">/month to you</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ForMentorsPage() {
  return (
    <div className="mentors-light pt-16">
      {/* 1. Hero */}
      <section className="mentors-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <p className="mentors-accent font-mono text-sm tracking-widest uppercase mb-6">The Opportunity</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-10">
          A generation that won&apos;t book a call{" "}
          <span className="mentors-accent">still needs your expertise.</span>
        </h1>
      </section>

      {/* 2. The Data — Gen Z stats */}
      <section className="mentors-cream-section px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="mentors-accent font-mono text-sm tracking-widest uppercase text-center">The Data</p>
          <div className="space-y-4 text-base md:text-lg leading-relaxed text-center">
            <p><strong style={{ color: "#1A1A1A" }}>9 out of 10</strong> <span className="mentors-muted">Gen Zers would rather text than pick up the phone.</span> <span className="text-sm" style={{ opacity: 0.4, color: "#737373" }}>(CommBank, 2023)</span></p>
            <p><strong style={{ color: "#1A1A1A" }}>70%</strong> <span className="mentors-muted">of 18-34 year olds prefer text over calls. 23% never answer their phone at all.</span> <span className="text-sm" style={{ opacity: 0.4, color: "#737373" }}>(BBC/Uswitch, 2024)</span></p>
          </div>
          <p className="text-lg md:text-xl text-center mentors-muted pt-4">
            This is the generation starting companies right now. They need mentorship. They <span className="mentors-accent">won&apos;t book a Calendly link</span> to get it.
          </p>
        </div>
      </section>

      {/* 3. How it works — elevated cards on white */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16 text-center" style={{ color: "#1A1A1A" }}>Here&apos;s what we do together.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="mentors-card-elevated p-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(184, 145, 106, 0.12)" }}>
                  <s.icon size={22} className="mentors-icon" stroke={1.5} />
                </div>
                <span className="mentors-accent font-mono text-xs font-bold">{s.num}</span>
                <h3 className="text-xl font-bold mt-2 mb-3" style={{ color: "#1A1A1A" }}>{s.title}</h3>
                <p className="mentors-muted leading-relaxed text-[15px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IP protection inline */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg mentors-muted">Your frameworks stay yours. We license, never own. You can pull your agent anytime. <strong style={{ color: "#1A1A1A" }}>Delaware LLC. Formal contract.</strong></p>
        </div>
      </section>

      {/* 4. Colin testimonial — dark section */}
      <section className="mentors-dark-section px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="mentors-accent text-5xl font-serif leading-none">&ldquo;</span>
          </div>
          <p className="text-xl md:text-2xl leading-relaxed text-center mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
            It forced me to articulate things I&apos;d been doing on autopilot for decades, and{" "}
            <strong style={{ color: "#FFFFFF" }}>the output captured my thinking better than I anticipated</strong>.
          </p>
          <p className="text-xl md:text-2xl leading-relaxed text-center mb-10" style={{ color: "rgba(255,255,255,0.9)" }}>
            I&apos;m happy to put my name on it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Image src="/mentors/colin-chapman.png" alt="Colin Chapman" width={48} height={48} className="rounded-[12px] object-cover" />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>Colin Chapman</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>GTM &amp; Outbound Sales · 26 years · First ForgeHouse Mentor</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Your part / Our part — asymmetric */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center" style={{ color: "#1A1A1A" }}>Collaborative Partnership</h2>
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(184, 145, 106, 0.12)" }}>
            {/* Your part — cream */}
            <div className="p-10" style={{ background: "#F8F5F0" }}>
              <h3 className="text-xl font-bold mb-8" style={{ color: "#1A1A1A" }}>You</h3>
              <ul className="space-y-6">
                {[
                  { icon: IconMicrophone, text: "A few conversations" },
                  { icon: IconEyeCheck, text: "Review until it feels right" },
                  { icon: IconShare, text: "Share when you're ready" },
                  { icon: IconCash, text: "Collect checks", accent: true },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={18} className="mentors-check mt-0.5" stroke={1.5} />
                    <span className={`leading-relaxed text-[15px] ${item.accent ? "mentors-accent font-semibold" : "mentors-body"}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Our part — dark navy */}
            <div className="p-10" style={{ background: "#1A2332" }}>
              <h3 className="text-xl font-bold mb-8" style={{ color: "#FFFFFF" }}>We</h3>
              <ul className="space-y-6">
                {[
                  { icon: IconCpu, text: "Build the agent" },
                  { icon: IconCode, text: "Handle all tech" },
                  { icon: IconHeadset, text: "Support subscribers" },
                  { icon: IconReceipt, text: "Manage billing & admin" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={18} className="mentors-check mt-0.5" stroke={1.5} />
                    <span className="leading-relaxed text-[15px]" style={{ color: "rgba(255,255,255,0.7)" }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The math — interactive calculator on cream */}
      <section className="mentors-cream-section px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center" style={{ color: "#1A1A1A" }}>The math</h2>
          <p className="mentors-muted text-lg mb-12 text-center">You set your own monthly subscription fee. Founders pay to access your expertise. You keep 75%.</p>
          <RevenueCalculator />
        </div>
      </section>

      {/* 75% / 100% callouts */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-lg mentors-muted"><span className="mentors-accent font-bold">75% revenue</span> is yours. You set the price. We handle billing, tech, and support.</p>
          <p className="text-lg mentors-muted"><span className="mentors-accent font-bold">100% IP</span> stays yours. Full ownership. Pull your agent anytime. No lock-in.</p>
        </div>
      </section>

      {/* 7. Customer proof — dark section */}
      <section className="mentors-dark-section px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-semibold leading-relaxed mb-4" style={{ color: "#FFFFFF" }}>
            &ldquo;I prefer the agent. It&apos;s a shortcut to the knowledge I need, available when I need it.&rdquo;
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            When offered direct access to the human mentor behind the agent, he declined.
          </p>
        </div>
      </section>

      {/* 8. CTA — contained dark card */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="mentors-cta-card px-10 py-16 md:px-16 md:py-20 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#FFFFFF" }}>Ready to start?</h2>
            <p className="text-lg mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Book a quick call. We&apos;ll map your expertise, set your boundaries, and get your agent live within the week.
            </p>
            <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.35)" }}>
              Your frameworks, your rules. Walk away anytime.
            </p>
            <a href="https://calendly.com/leon-apexalpha/27min" target="_blank" rel="noopener noreferrer" className="mentors-cta px-10 py-4 rounded-xl font-semibold transition inline-flex items-center gap-2 text-lg">
              Book a Call <IconArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
