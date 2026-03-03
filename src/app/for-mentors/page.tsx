"use client";
import Link from "next/link";
import { IconBrain, IconClock, IconUsers, IconCurrencyDollar, IconArrowRight, IconCheck } from "@tabler/icons-react";

const steps = [
  { num: "01", title: "Extract.", desc: "We conduct deep sessions to capture your frameworks, mental models, and real-world advice. 2-3 sessions, ~60 minutes each." },
  { num: "02", title: "Build.", desc: "We train an AI agent that thinks and responds like you. Not a generic chatbot. Your actual expertise, calibrated until you trust it." },
  { num: "03", title: "Launch.", desc: "Your agent goes live on ForgeHouse. Subscribers get 24/7 access. You get reach, revenue, and leads." },
];

const benefits = [
  { icon: IconUsers, title: "Reach without time.", desc: "Help hundreds of people simultaneously without a single extra call. Your knowledge works while you don't." },
  { icon: IconCurrencyDollar, title: "Revenue from every conversation.", desc: "Earn from your agent's usage. Passive income from decades of expertise. You set your price." },
  { icon: IconBrain, title: "Consulting leads, pre-qualified.", desc: "Every subscriber is a potential high-ticket client. Your agent qualifies them and refers them to you directly." },
  { icon: IconClock, title: "Two-way growth.", desc: "You promote your agent to your network. We send warm leads to your consulting practice. Both sides win." },
];

const whatYouDont = [
  "No content creation",
  "No prompt engineering",
  "No tech setup",
  "No customer support",
  "No scheduling or admin",
];

const whatYouDo = [
  "2-3 extraction sessions (one-time)",
  "Review v1 of your agent (30 min)",
  "Share with your network when you're happy",
  "Collect checks",
];

export default function ForMentorsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <p className="text-amber font-mono text-sm tracking-widest uppercase mb-6">For Mentors</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          More people need what you know<br />
          than you&apos;ll ever have{" "}
          <span className="text-amber">time to help.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ForgeHouse turns elite mentors into AI agents. Trained on your real expertise, available to subscribers 24/7. You stay in control. Your knowledge works while you don&apos;t.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2">
            Apply Now <IconArrowRight size={18} />
          </Link>
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

      {/* What you get */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto section-module gradient-blue">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">What you get</h2>
          <p className="text-muted text-lg max-w-3xl mx-auto mb-16 leading-relaxed text-center">
            Your expertise, compounding. Without trading more hours for it.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="glass-card p-8">
                <b.icon size={32} stroke={1.5} className="mb-4 text-amber" />
                <h3 className="text-lg font-bold mb-3">{b.title}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue model */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Simple economics</h2>
          <p className="text-muted text-lg mb-12 leading-relaxed">You set your mentor price. You keep 75%. We handle everything else.</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-8">
              <p className="text-3xl font-bold text-amber mb-2">10</p>
              <p className="text-muted text-sm">subscribers</p>
              <p className="text-xl font-bold mt-3">$1,125/mo</p>
            </div>
            <div className="glass-card p-8">
              <p className="text-3xl font-bold text-amber mb-2">25</p>
              <p className="text-muted text-sm">subscribers</p>
              <p className="text-xl font-bold mt-3">$2,812/mo</p>
            </div>
            <div className="glass-card p-8">
              <p className="text-3xl font-bold text-amber mb-2">50</p>
              <p className="text-muted text-sm">subscribers</p>
              <p className="text-xl font-bold mt-3">$5,625/mo</p>
            </div>
          </div>
          <p className="text-muted text-sm">Based on $150/mo mentor price. Platform fee ($47/mo) paid by subscriber, 100% to ForgeHouse.</p>
        </div>
      </section>

      {/* What you do / don't do */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">What you do</h3>
              <ul className="space-y-4">
                {whatYouDo.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">What we handle</h3>
              <ul className="space-y-4">
                {whatYouDont.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proof: Colin */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto section-module">
          <p className="text-amber font-mono text-sm tracking-widest uppercase mb-6 text-center">First Mentor Live</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Colin Chapman</h2>
          <p className="text-muted text-lg text-center mb-8 leading-relaxed">
            GTM Strategy &amp; Outbound Sales · 26 years experience · 4.92★ on GrowthMentor
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Status</p>
              <p className="font-semibold">Live on ForgeHouse</p>
            </div>
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Platform</p>
              <p className="font-semibold">$47/mo per subscriber</p>
            </div>
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Mentor Cost</p>
              <p className="font-semibold">Free at launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* IP Protection */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Your IP stays yours</h2>
          <p className="text-muted text-lg leading-relaxed mb-4">
            Your frameworks remain your property. ForgeHouse has a license to operate the agent, not ownership of your intellectual property. You can request removal at any time. Extraction recordings stay confidential.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to extend your reach?</h2>
          <p className="text-muted text-lg mb-10 leading-relaxed">Limited spots. We handpick every mentor.</p>
          <Link href="/apply" className="bg-amber text-white px-10 py-4 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2 text-lg">
            Apply Now <IconArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
