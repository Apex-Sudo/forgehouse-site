"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PlugsConnected, ChatCircleDots } from "@phosphor-icons/react";

export default function ModulesPage() {
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
          Expert knowledge, <span className="text-amber">packaged.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Each module is built from one expert&apos;s real experience. Plug it into your agent or use it directly.
        </p>
      </section>

      {/* Colin Module */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            {/* Header */}
            <div className="flex items-start gap-5 mb-6">
              <Image
                src="/mentors/colin-chapman.png"
                alt="Colin Chapman"
                width={64}
                height={64}
                className="rounded-2xl object-cover shrink-0"
              />
              <div>
                <p className="text-xs text-amber font-semibold uppercase tracking-wider mb-1">Sales Module</p>
                <h2 className="text-2xl font-bold mb-1">Colin Chapman</h2>
                <p className="text-muted text-sm">GTM & Outbound Sales · 26 years</p>
              </div>
            </div>

            {/* What the module does */}
            <p className="text-foreground/80 text-[15px] leading-relaxed mb-6">
              26 years of closing deals, diagnosing pipelines, and building outbound systems. Cold email sequences, ICP definition, deal strategy, messaging review. Available as a chat or an MCP module for your agent.
            </p>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["Cold outbound strategy", "Pipeline diagnosis", "ICP definition", "Deal stage coaching", "Messaging review", "GTM planning"].map((cap) => (
                <div key={cap} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-amber text-xs">→</span> {cap}
                </div>
              ))}
            </div>

            {/* Two paths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Link
                href="/chat/colin-chapman"
                className="flex items-center justify-center gap-2 bg-amber text-background py-3.5 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
              >
                <ChatCircleDots size={18} weight="bold" />
                Chat with Colin&apos;s agent
              </Link>
              <Link
                href="/mentors/colin-chapman"
                className="flex items-center justify-center gap-2 border border-white/10 text-muted py-3.5 rounded-xl font-medium hover:text-foreground hover:border-white/20 transition cursor-pointer"
              >
                Learn more
              </Link>
            </div>

            <p className="text-xs text-muted text-center">5 free messages. No card required.</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Coming Soon */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-amber font-semibold uppercase tracking-widest mb-4">In the forge</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">More modules are being forged.</h2>
          <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
            Each one goes through weeks of extraction before it goes live. We don&apos;t rush this.
          </p>

          {/* Upcoming modules */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto">
            {[
              { label: "Brand & Reputation", desc: "Positioning, narrative, PR" },
              { label: "Revenue Operations", desc: "Systems, metrics, forecasting" },
              { label: "Product Strategy", desc: "Roadmap, prioritization, PMF" },
            ].map((mod) => (
              <div key={mod.label} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white/10 text-lg">?</span>
                </div>
                <p className="text-[11px] text-muted/70 font-medium">{mod.label}</p>
                <p className="text-[10px] text-muted/40 mt-0.5">{mod.desc}</p>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          {submitted ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <p className="text-amber font-medium">You&apos;re on the list.</p>
              <p className="text-muted text-sm mt-1">We&apos;ll notify you when the next module goes live.</p>
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
                className="bg-amber text-background px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? "..." : "Notify me"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Expert recruitment CTA */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted mb-3">Have expertise worth preserving?</p>
          <Link href="/apply" className="text-amber hover:underline font-medium">
            Apply to become an expert →
          </Link>
        </div>
      </section>
    </div>
  );
}
