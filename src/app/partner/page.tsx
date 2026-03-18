"use client";
import { useState } from "react";
import Image from "next/image";
import { IconMicrophone, IconEyeCheck, IconShare, IconCash, IconCpu, IconCode, IconHeadset, IconReceipt } from "@tabler/icons-react";
import "./partner.css";

const steps = [
  { num: "01", title: "We talk.", desc: "2-3 conversations. You explain how you think. We capture the patterns." },
  { num: "02", title: "We build.", desc: "Your thinking becomes an AI agent. Tested until you'd trust it with a client." },
  { num: "03", title: "It works.", desc: "Available 24/7. You get reach, revenue, and leads you didn't chase." },
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
      <div className="partner-card p-10 flex flex-col items-center gap-4 mb-16 max-w-md mx-auto">
        <label className="text-muted text-base">What would you charge per month?</label>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-muted">$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            className="text-6xl font-bold bg-transparent border-b-3 border-amber focus:border-amber outline-none w-44 text-center transition"
          />
          <span className="text-xl text-muted">/mo</span>
        </div>
        <p className="text-xs text-muted/50 mt-1">You keep 75%.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 text-center items-end">
        {scenarios.map(({ count, label }, i) => {
          const monthly = Math.round(price * mentorCut * count);
          const isMiddle = i === 1;
          const isLast = i === 2;
          return (
            <div
              key={count}
              className={`partner-card text-center transition-all ${
                isLast
                  ? "p-10 border-2 border-amber/30 shadow-[0_8px_30px_rgba(184,145,106,0.15)]"
                  : isMiddle
                  ? "p-9"
                  : "p-8 opacity-80"
              }`}
            >
              <p className="text-xs font-semibold text-muted/50 uppercase tracking-widest mb-3">{label}</p>
              <p className="text-2xl font-bold partner-accent mb-1">{count}</p>
              <p className="text-sm text-muted mb-5">subscribers</p>
              <p className={`font-bold mb-1 ${isLast ? "text-6xl" : isMiddle ? "text-5xl" : "text-4xl"}`}>
                ${monthly.toLocaleString()}
              </p>
              <p className="text-sm text-muted mt-2">/month to you</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PartnerPage() {
  return (
    <div className="partner-light pt-16">
      {/* 1. The Shift */}
      <section className="partner-hero px-6 py-28 md:py-40 max-w-4xl mx-auto text-center">
        <p className="partner-accent font-mono text-sm tracking-widest uppercase mb-8">The Opportunity</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
          A generation that won&apos;t book a call
          <br />
          <span className="partner-accent">still needs your expertise.</span>
        </h1>
        <p className="text-muted text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
          They&apos;ll text at 2 AM before they&apos;ll schedule a meeting. Your delivery model changed. Your value didn&apos;t.
        </p>
      </section>

      {/* 2. How it works */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Three steps. Then it runs.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <span className="partner-accent font-mono text-sm">{s.num}</span>
                <h3 className="text-2xl font-bold mt-3 mb-3">{s.title}</h3>
                <p className="text-muted text-lg leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Proof */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="partner-card p-10">
            <p className="text-lg text-muted/80 leading-relaxed italic mb-6">&ldquo;It forced me to articulate things I&apos;d been doing on autopilot for decades. The output captured my thinking better than I anticipated. I&apos;m happy to put my name on it.&rdquo;</p>
            <div className="flex items-center gap-3">
              <Image src="/mentors/colin-chapman.png" alt="Colin Chapman" width={44} height={44} className="rounded-full object-cover" />
              <div>
                <p className="font-semibold">Colin Chapman</p>
                <p className="text-sm text-muted">GTM &amp; Outbound Sales · 26 years</p>
              </div>
            </div>
          </div>

          <div className="py-10 text-center">
            <p className="text-2xl font-bold mb-2">Our first customer chose the agent over the human.</p>
            <p className="text-muted text-lg">&ldquo;I prefer the agent. It&apos;s a shortcut to the knowledge I need, available when I need it.&rdquo;</p>
          </div>
        </div>
      </section>

      {/* 4. Your part / Our part */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="partner-card grid md:grid-cols-2 gap-0 overflow-hidden">
            <div className="p-10 text-center border-b md:border-b-0 md:border-r border-foreground/[0.1]">
              <h3 className="text-2xl font-bold mb-8">You</h3>
              <ul className="space-y-5 text-lg text-muted">
                <li className="flex items-center justify-center gap-3"><IconMicrophone size={20} className="partner-accent shrink-0" /> A few conversations</li>
                <li className="flex items-center justify-center gap-3"><IconEyeCheck size={20} className="partner-accent shrink-0" /> Review until it feels right</li>
                <li className="flex items-center justify-center gap-3"><IconShare size={20} className="partner-accent shrink-0" /> Share when you&apos;re ready</li>
                <li className="flex items-center justify-center gap-3 partner-accent font-semibold"><IconCash size={20} className="shrink-0" /> Collect checks</li>
              </ul>
            </div>
            <div className="p-10 text-center">
              <h3 className="text-2xl font-bold mb-8">We</h3>
              <ul className="space-y-5 text-lg text-muted">
                <li className="flex items-center justify-center gap-3"><IconCpu size={20} className="partner-accent shrink-0" /> Build the agent</li>
                <li className="flex items-center justify-center gap-3"><IconCode size={20} className="partner-accent shrink-0" /> Handle all tech</li>
                <li className="flex items-center justify-center gap-3"><IconHeadset size={20} className="partner-accent shrink-0" /> Support subscribers</li>
                <li className="flex items-center justify-center gap-3"><IconReceipt size={20} className="partner-accent shrink-0" /> Manage billing &amp; admin</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Math — Calculator */}
      <section className="px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">The math</h2>
        <p className="text-muted text-lg mb-12 text-center">Your price. Your revenue.</p>
        <RevenueCalculator />
      </section>

      {/* 6. Next Step */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Next step</h2>
          <p className="text-muted text-xl leading-relaxed mb-4">
            2-3 conversations over the next two weeks. Your agent is live within days of your final review.
          </p>
          <p className="text-muted/50 text-sm">
            Your frameworks stay yours. You can pull it anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
