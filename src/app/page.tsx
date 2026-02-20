"use client";
import Link from "next/link";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";

const steps = [
  { num: "01", title: "Browse agents", desc: "Each one trained by a real founder with real scars." },
  { num: "02", title: "Start a conversation", desc: "No prompts needed. Just tell it what you're working on." },
  { num: "03", title: "Get sharper decisions", desc: "Not answers. Better questions. Faster clarity." },
];

const trustPoints = [
  { title: "Vetted mentors only", desc: "Every agent is backed by a founder with real operating experience. No anonymous bots." },
  { title: "Trained, not templated", desc: "Each agent is built through deep conversational extraction. Not a system prompt copy-paste." },
  { title: "Always available", desc: "Your mentor has a calendar. Their agent doesn't. Get clarity at 2 AM or 2 PM." },
];

export default function Home() {
  const [mentorForm, setMentorForm] = useState({ name: "", email: "", expertise: "" });
  const [mentorSubmitted, setMentorSubmitted] = useState(false);
  const [mentorSubmitting, setMentorSubmitting] = useState(false);

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMentorSubmitting(true);
    try {
      await fetch("/api/mentor-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentorForm),
      });
      setMentorSubmitted(true);
    } catch {
      setMentorSubmitted(true);
    } finally {
      setMentorSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="px-6 py-32 md:py-44 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          The only thing better than a mentor is access to their brain{" "}
          <span className="text-amber">24/7</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Every agent on ForgeHouse is trained by a vetted founder or operator.
          Not a prompt template. A real person&apos;s decision-making patterns,
          available whenever you need them.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/agents" className="bg-amber text-background px-8 py-3 font-semibold hover:bg-amber-dark transition text-center">
            Meet the Agents
          </Link>
          <Link href="/chat/apex" className="border border-border px-8 py-3 font-semibold hover:border-amber/40 transition text-center">
            Try Apex Now
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s) => (
              <div key={s.num}>
                <span className="text-amber font-mono text-sm">{s.num}</span>
                <h3 className="text-xl font-bold mt-2 mb-3">{s.title}</h3>
                <p className="text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human-Vetted Trust Section */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Real founders. Real pattern recognition.</h2>
          <p className="text-muted text-lg max-w-3xl mb-16 leading-relaxed">
            We don&apos;t scrape the internet and call it intelligence. Every ForgeHouse agent
            is built from hours of structured interviews with a real founder or operator.
            Their frameworks, their blind spots, their hard-won instincts. Compressed into
            an agent you can talk to anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            {trustPoints.map((t) => (
              <div key={t.title}>
                <h3 className="text-xl font-bold mb-3">{t.title}</h3>
                <p className="text-muted leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured agent */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Featured agent</h2>
          <p className="text-muted mb-12">The first. More are being forged.</p>
          <div className="max-w-sm">
            <AgentCard
              name="Apex"
              emoji="🔺"
              tagline="Trained by a founder who built across three continents. Doesn't give advice. Gives you the right question."
              tags={["Strategy", "Decision-Making", "Founder Ops"]}
              price="Free during beta"
              href="/agents/apex"
            />
          </div>
        </div>
      </section>

      {/* Become a Mentor */}
      <section id="for-mentors" className="px-6 py-24 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Built something real? Your agent should exist.</h2>
          <p className="text-muted text-lg mb-12 leading-relaxed">
            If you&apos;re a founder, operator, or domain expert, we&apos;ll build an agent
            trained on your frameworks and make it available to thousands of founders
            who need what you know.
          </p>
          {mentorSubmitted ? (
            <div className="border border-amber/30 bg-amber/5 p-8 text-center">
              <p className="text-lg font-semibold mb-2">Thanks for your interest.</p>
              <p className="text-muted">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleMentorSubmit} className="space-y-4 max-w-lg">
              <input
                type="text"
                placeholder="Name"
                required
                value={mentorForm.name}
                onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                className="w-full bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={mentorForm.email}
                onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                className="w-full bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition"
              />
              <textarea
                placeholder="One line about your expertise"
                required
                value={mentorForm.expertise}
                onChange={(e) => setMentorForm({ ...mentorForm, expertise: e.target.value })}
                rows={3}
                className="w-full bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition resize-none"
              />
              <button
                type="submit"
                disabled={mentorSubmitting}
                className="bg-amber text-background px-8 py-3 font-semibold hover:bg-amber-dark transition disabled:opacity-50"
              >
                {mentorSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 border-t border-border text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop asking for answers.<br />Start asking better questions.</h2>
        <Link href="/chat/apex" className="inline-block bg-amber text-background px-10 py-4 font-semibold text-lg hover:bg-amber-dark transition">
          Talk to Apex
        </Link>
      </section>
    </div>
  );
}
