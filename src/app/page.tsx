"use client";
import Link from "next/link";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";
import InlineChat from "@/components/InlineChat";

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
  const [mentorForm, setMentorForm] = useState({ name: "", email: "", linkedin: "", role: "", expertise: "", whyForgeHouse: "", contentLink: "" });
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
      {/* Hero — gradient glow from top */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          The only thing better than a mentor is access to their brain{" "}
          <span className="text-amber">24/7</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Every agent on ForgeHouse is trained by a vetted founder or operator.
          Not a prompt template. A real person&apos;s decision-making patterns,
          available whenever you need them.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/agents" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center">
            Meet the Agents
          </Link>
          <Link href="/chat/apex" className="border border-border-light px-8 py-3.5 rounded-xl font-semibold hover:border-amber/30 hover:bg-white/[0.02] transition text-center">
            Try Apex Now
          </Link>
        </div>
      </section>

      {/* Inline Chat — contained module */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-muted text-center mb-6">Ask Apex anything</p>
          <InlineChat />
        </div>
      </section>

      {/* How it works — glass cards */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16">How it works</h2>
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

      {/* Human-Vetted Trust Section — blue gradient bg, contained */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto section-module gradient-blue">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Real founders. Real pattern recognition.</h2>
          <p className="text-muted text-lg max-w-3xl mb-16 leading-relaxed">
            We don&apos;t scrape the internet and call it intelligence. Every ForgeHouse agent
            is built from hours of structured interviews with a real founder or operator.
            Their frameworks, their blind spots, their hard-won instincts. Compressed into
            an agent you can talk to anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {trustPoints.map((t) => (
              <div key={t.title}>
                <h3 className="text-lg font-bold mb-3">{t.title}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured agent */}
      <section className="px-6 py-24">
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

      {/* Mentor Application — glass module */}
      <section id="for-mentors" className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto section-module">
          <p className="text-muted/60 text-sm mb-8 tracking-wide uppercase">Applications are reviewed weekly</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Apply to become a ForgeHouse mentor</h2>
          <p className="text-muted text-lg mb-12 leading-relaxed">
            We work with a small number of vetted founders and operators. If you&apos;ve
            built something real, led teams through hard problems, or developed frameworks
            others pay for, we want to hear from you. Not everyone gets in.
          </p>
          {mentorSubmitted ? (
            <div className="border border-amber/20 bg-amber/5 p-8 text-center rounded-xl">
              <p className="text-lg font-semibold mb-2">Application received.</p>
              <p className="text-muted">We review every submission personally. If there&apos;s a fit, we&apos;ll be in touch within 5 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleMentorSubmit} className="space-y-4 max-w-lg">
              <input
                type="text"
                placeholder="Full name"
                required
                value={mentorForm.name}
                onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={mentorForm.email}
                onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <input
                type="url"
                placeholder="LinkedIn profile URL"
                required
                value={mentorForm.linkedin}
                onChange={(e) => setMentorForm({ ...mentorForm, linkedin: e.target.value })}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <input
                type="text"
                placeholder="Current role and company"
                required
                value={mentorForm.role}
                onChange={(e) => setMentorForm({ ...mentorForm, role: e.target.value })}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <textarea
                placeholder="What do you know better than most people? (e.g., B2B SaaS pricing, marketplace growth, founder psychology)"
                required
                value={mentorForm.expertise}
                onChange={(e) => setMentorForm({ ...mentorForm, expertise: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition resize-none"
              />
              <textarea
                placeholder="Why do you want your frameworks available as an AI agent?"
                required
                value={mentorForm.whyForgeHouse}
                onChange={(e) => setMentorForm({ ...mentorForm, whyForgeHouse: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <input
                type="url"
                placeholder="Blog post, talk, podcast, or thread that shows how you think (optional)"
                value={mentorForm.contentLink}
                onChange={(e) => setMentorForm({ ...mentorForm, contentLink: e.target.value })}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <button
                type="submit"
                disabled={mentorSubmitting}
                className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition disabled:opacity-50"
              >
                {mentorSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop asking for answers.<br />Start asking better questions.</h2>
          <p className="text-muted text-lg mb-8">Apex is ready when you are.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
