"use client";
import Link from "next/link";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";
import InlineChat from "@/components/InlineChat";

const steps = [
  { num: "01", title: "Pick a mentor", desc: "Browse founders and operators who've solved what you're facing. Each one is vetted." },
  { num: "02", title: "Talk to their agent", desc: "No scheduling. No waiting. Just tell it what you're working on and get their thinking instantly." },
  { num: "03", title: "Get unstuck faster", desc: "The right question at 2 AM is worth more than a booked call next Thursday." },
];

const trustPoints = [
  { icon: "💬", title: "Built from real conversations", desc: "Every agent is trained through hours of structured interviews. Not scraped content. Not a bio turned into a prompt. Their actual decision-making patterns." },
  { icon: "⚡", title: "Available between sessions", desc: "The best mentors are fully booked. Their agents aren't. Get the frameworks and thinking you need, whenever momentum demands it." },
  { icon: "📈", title: "Quality that scales", desc: "A great mentor can only take so many calls. Their agent carries the same instincts to everyone who needs them, without the bottleneck." },
  { icon: "🌍", title: "World-class, in your language", desc: "The best person in your industry probably doesn't speak your language. Their agent does. Get top-of-field thinking in your native tongue, not a second-choice mentor because of a language barrier." },
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
      {/* Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Your favorite mentor is{" "}
          <span className="text-amber">fully booked</span>.
          <br />
          Their agent isn&apos;t.
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ForgeHouse turns the world&apos;s best mentors into AI agents you can talk to anytime.
          Same frameworks. Same instincts. No calendar required.
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
          <p className="text-sm text-muted text-center mb-6">No scheduling. No waiting. Just ask.</p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Mentorship that doesn&apos;t depend on availability</h2>
          <p className="text-muted text-lg max-w-3xl mx-auto mb-16 leading-relaxed text-center">
            The gap between needing help and getting it kills momentum.
            ForgeHouse closes that gap by turning proven mentors into agents
            that carry their thinking, available the moment you need it.
          </p>
          <div className="grid md:grid-cols-2 gap-10">
            {trustPoints.map((t) => (
              <div key={t.title}>
                <div className="text-3xl mb-4">{t.icon}</div>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Featured agent</h2>
          <p className="text-muted mb-12 text-center">The first. More are being forged.</p>
          <div className="max-w-sm mx-auto">
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

      {/* Mentor Application */}
      <section id="for-mentors" className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto section-module">
          <p className="text-muted/60 text-sm mb-8 tracking-wide uppercase text-center">Applications are reviewed weekly</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Your expertise, available at scale</h2>
          <p className="text-muted text-lg mb-12 leading-relaxed text-center">
            You already have the frameworks. You already have clients who want more of your time
            than you can give. We turn your thinking into an agent that extends your reach
            without diluting your quality. Not everyone gets in.
          </p>
          {mentorSubmitted ? (
            <div className="border border-amber/20 bg-amber/5 p-8 text-center rounded-xl">
              <p className="text-lg font-semibold mb-2">Application received.</p>
              <p className="text-muted">We review every submission personally. If there&apos;s a fit, we&apos;ll be in touch within 5 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleMentorSubmit} className="space-y-4 max-w-lg mx-auto">
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
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={mentorSubmitting}
                  className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition disabled:opacity-50"
                >
                  {mentorSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Momentum doesn&apos;t wait<br />for office hours.</h2>
          <p className="text-muted text-lg mb-8">Talk to Apex now. No signup required.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
