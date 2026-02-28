"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconArrowRight, IconMessageCircle, IconClock, IconBrain } from "@tabler/icons-react";

export default function MentorsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
          The person who already made
          <br />
          <span className="text-amber">your next call.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          You don&apos;t need more advice. You need the right voice.
          Someone who&apos;s been where you are and knows what happens next.
        </p>
      </section>

      {/* Colin - Rich Card */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-muted uppercase tracking-widest mb-6 text-center">Live now</p>

          <div className="glass-card p-8 md:p-10">
            {/* Header */}
            <div className="flex items-start gap-5 mb-6">
              <img
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                className="w-16 h-16 rounded-2xl object-cover shrink-0"
              />
              <div>
                <h2 className="text-2xl font-bold mb-1">Colin Chapman</h2>
                <p className="text-muted text-sm">GTM & Outbound Sales · 25+ years of closing B2B deals</p>
              </div>
            </div>

            {/* Problem statement */}
            <p className="text-foreground/80 text-[15px] leading-relaxed mb-6">
              Your pipeline isn&apos;t broken. Your message is. Colin has spent 25 years
              diagnosing why outbound stalls, why deals die after the first call, and why
              founders keep building what nobody asked for.
            </p>

            {/* What Colin solves */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <IconMessageCircle size={18} className="text-amber mb-2" />
                <p className="text-sm text-muted">
                  &ldquo;Our outbound gets meetings but deals stall after the first call.&rdquo;
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <IconBrain size={18} className="text-amber mb-2" />
                <p className="text-sm text-muted">
                  &ldquo;I keep rewriting our ICP and nothing feels right.&rdquo;
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <IconClock size={18} className="text-amber mb-2" />
                <p className="text-sm text-muted">
                  &ldquo;One wrong GTM decision here could cost me 6 months.&rdquo;
                </p>
              </div>
            </div>

            {/* Proof line */}
            <p className="text-xs text-muted mb-6">
              Built from structured extraction sessions. Real frameworks, not summaries.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/chat/colin-chapman"
                className="flex-1 bg-amber text-white py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center cursor-pointer"
              >
                Talk to Colin
              </Link>
              <Link
                href="/mentors/colin-chapman"
                className="flex-1 border border-white/10 text-muted py-3.5 rounded-xl font-medium hover:text-foreground hover:border-white/20 transition text-center cursor-pointer"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon / Waitlist */}
      <section className="px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">In the forge</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">More mentors are being forged.</h2>
          <p className="text-muted text-lg mb-4 max-w-xl mx-auto">
            Revenue operators. Product leaders. Founders who&apos;ve scaled past $10M.
            Each one goes through weeks of extraction before they go live.
          </p>
          <p className="text-muted text-sm mb-8">
            We don&apos;t rush this. Every mentor earns their place.
          </p>

          {/* Upcoming silhouettes */}
          <div className="flex justify-center gap-4 mb-10">
            {["Brand & Reputation", "Revenue Operations", "Product Strategy"].map((label) => (
              <div key={label} className="w-24 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white/10 text-lg">?</span>
                </div>
                <p className="text-[11px] text-muted/50">{label}</p>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          {submitted ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <p className="text-amber font-medium">You&apos;re on the list.</p>
              <p className="text-muted text-sm mt-1">We&apos;ll notify you when the next mentor goes live.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-dark transition text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? "..." : "Notify me"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Mentor recruitment CTA */}
      <section className="px-6 py-16 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted mb-3">Have frameworks worth preserving?</p>
          <Link href="/apply" className="text-amber hover:underline font-medium">
            Apply to become a mentor →
          </Link>
        </div>
      </section>
    </div>
  );
}
