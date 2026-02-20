"use client";
import Link from "next/link";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";
import InlineChat from "@/components/InlineChat";
import { ChatCircleDots, Lightning, ChartLineUp, ShieldCheck } from "@phosphor-icons/react";

const steps = [
  { num: "01", title: "Pick a mentor", desc: "Founders and operators who've actually built what you're trying to build. Vetted for real decisions, not credentials." },
  { num: "02", title: "Talk to their agent", desc: "Their thinking, available right now. No scheduling, no small talk, no re-explaining your situation every session." },
  { num: "03", title: "Get clarity in minutes", desc: "The kind of clarity that used to cost $300/hour and a two-week wait. Available the moment the decision is in front of you." },
];

const trustPoints = [
  { icon: ChatCircleDots, title: "Not a chatbot. Their actual thinking.", desc: "Every agent is built from hours of structured extraction. Real decision-making patterns from someone who's made the calls you're about to make." },
  { icon: Lightning, title: "No calendar. No waiting.", desc: "At 2 AM when the decision won't let you sleep, their agent is ready. No booking link, no two-week wait, no $500 minimum." },
  { icon: ChartLineUp, title: "What one session costs, unlimited.", desc: "A good mentor charges $300-500/hour. One conversation here costs less than one live session. Except it never runs out." },
  { icon: ShieldCheck, title: "Built it, not taught it.", desc: "No influencers. No theorists. Every mentor on ForgeHouse has made the hard calls themselves. If they haven't done the thing, they're not on the platform." },
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
          Tap into{" "}
          <span className="text-amber">brilliance.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The best mentors are fully booked. ForgeHouse captures how they actually think
          and makes it available the moment you need it. No calendar. No $500 minimums.
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
          <p className="text-sm text-muted text-center mb-6">The kind of conversation that used to require a $300 booking. Try it now.</p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">You&apos;re not paying for information. You&apos;re paying for time.</h2>
          <p className="text-muted text-lg max-w-3xl mx-auto mb-16 leading-relaxed text-center">
            Free content teaches tactics. A mentor shows you the blind spots you didn&apos;t know you had.
            That&apos;s the difference between googling &quot;how to negotiate&quot; and asking someone who&apos;s closed 500 deals.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {trustPoints.map((t) => (
              <div key={t.title} className="glass-card p-8 text-center">
                <t.icon size={32} weight="light" className="mx-auto mb-4 text-[#3B82F6]" />
                <h3 className="text-lg font-bold mb-3">{t.title}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to agents */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">One conversation changed everything for them</h2>
          <p className="text-muted mb-8">Apex is free. No card, no signup. See what a real sounding board feels like.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>

      {/* Mentor Application */}
      <section id="for-mentors" className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto section-module">
          <p className="text-muted/60 text-sm mb-8 tracking-wide uppercase text-center">Applications are reviewed weekly</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Your MasterClass is 4 hours, then it&apos;s over</h2>
          <p className="text-muted text-lg mb-12 leading-relaxed text-center">
            Your agent thinks like you 24/7 and compounds with every conversation.
            Same decision-making, same frameworks, available when you can&apos;t be.
            You keep earning from expertise you&apos;ve already built.
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
                placeholder="What do people come to you for? (e.g., outbound strategy, pricing, founder psychology)"
                required
                value={mentorForm.expertise}
                onChange={(e) => setMentorForm({ ...mentorForm, expertise: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition resize-none"
              />
              <textarea
                placeholder="Why does this interest you?"
                required
                value={mentorForm.whyForgeHouse}
                onChange={(e) => setMentorForm({ ...mentorForm, whyForgeHouse: e.target.value })}
                rows={3}
                className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
              />
              <input
                type="url"
                placeholder="Link to something that shows how you think (blog, talk, thread)"
                required
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The $0 option is what kills most startups.</h2>
          <p className="text-muted text-lg mb-8">Not bad ideas. Not bad execution. Just no one to say &quot;that&apos;s the wrong direction&quot; before you spend 6 months on it.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
