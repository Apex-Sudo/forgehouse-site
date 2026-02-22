"use client";
import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import InlineChat from "@/components/InlineChat";
import { IconMessageCircle, IconBolt, IconTrendingUp, IconShieldCheck } from "@tabler/icons-react";

const steps = [
  { num: "01", title: "Pick a mentor", desc: "Founders and operators who've actually built what you're trying to build. Vetted for real decisions, not credentials." },
  { num: "02", title: "Talk to their agent", desc: "Their thinking, available right now. No scheduling, no small talk, no re-explaining your situation every session." },
  { num: "03", title: "Get clarity in minutes", desc: "Clarity the moment the decision is in front of you." },
];

const trustPoints = [
  { icon: IconMessageCircle, title: "Not a chatbot. Their actual thinking.", desc: "Every agent is built from hours of structured conversation. Real decision-making patterns from someone who's made the calls you're about to make." },
  { icon: IconBolt, title: "No calendar. No waiting.", desc: "2 AM, can't sleep, big decision ahead. They're ready." },
  { icon: IconTrendingUp, title: "Saved me months of wrong turns.", desc: "Their hindsight, your edge." },
  { icon: IconShieldCheck, title: "Built it, not taught it.", desc: "Every mentor on ForgeHouse has made the hard calls themselves. No influencers. No theorists." },
];

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Access{" "}
          <span className="text-amber">brilliance.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          World-class mentors, forged. Available the moment you need them.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agents" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center">
            Meet the Agents
          </Link>
          <Link href="/chat/apex" className="border border-border-light px-8 py-3.5 rounded-xl font-semibold hover:border-amber/30 hover:bg-white/[0.02] transition text-center">
            Try Apex Now
          </Link>
        </div>
      </section>

      {/* Inline Chat */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-muted text-center mb-6">The kind of clarity that takes years to earn. Yours in one conversation.</p>
          <InlineChat />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="glass-card p-8">
                <span className="text-amber font-mono text-sm">{s.num}</span>
                <h3 className="text-xl font-bold mt-3 mb-3">{s.title}</h3>
                <p className="text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto section-module gradient-blue">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">20 years of pattern recognition. On demand.</h2>
          <p className="text-muted text-lg max-w-3xl mx-auto mb-16 leading-relaxed text-center">
            Every mentor on ForgeHouse earned their frameworks the hard way. Now those frameworks are in your corner, whenever you need them.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {trustPoints.map((t) => (
              <div key={t.title} className="glass-card p-8 text-center">
                <t.icon size={32} stroke={1.5} className="mx-auto mb-4 text-[#3B82F6]" />
                <h3 className="text-lg font-bold mb-3">{t.title}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your first 5 messages are on us.</h2>
          <p className="text-muted text-lg mb-8"></p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
