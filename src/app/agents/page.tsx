"use client";
import { useState } from "react";
import AgentCard from "@/components/AgentCard";

export default function AgentsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      <section className="gradient-hero px-6 py-24 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Agents</h1>
        <p className="text-muted text-lg mb-16">Each one trained by a real founder. Each one thinks different.</p>
        <div className="max-w-sm mx-auto mb-20">
          <AgentCard
            name="Apex"
            emoji="🔺"
            tagline="Trained by a founder who built across three continents. Gives you the question before the question."
            tags={["Strategy", "Decision-Making", "Founder Ops"]}
            price="Free during beta"
            href="/agents/apex"
          />
        </div>

        {/* Waitlist */}
        <div className="glass-card p-8 md:p-12 max-w-xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Next agents are being forged.</h2>
          <p className="text-muted mb-6">Get early access when new agents launch.</p>
          {submitted ? (
            <div className="border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-6 rounded-xl text-center">
              <p className="font-semibold">You&apos;re on the list.</p>
              <p className="text-muted text-sm mt-1">We&apos;ll notify you when new agents drop.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-[#3B82F6]/40 transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#2563EB] transition disabled:opacity-50 whitespace-nowrap"
              >
                {submitting ? "Joining..." : "Get Early Access"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
