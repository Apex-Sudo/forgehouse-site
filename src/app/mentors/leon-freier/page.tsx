"use client";
import Link from "next/link";
import { ChatCircleDots, Lightning, Target, Star, Globe, Bed } from "@phosphor-icons/react";

const highlights = [
  { icon: Target, label: "10 years in short-term rentals" },
  { icon: Globe, label: "Luxury villas in Vietnam" },
  { icon: Bed, label: "350+ five-star reviews" },
  { icon: Lightning, label: "Trained on real operator experience" },
];

const sessions = [
  {
    num: "01",
    title: "You're stuck at budget-tier properties",
    desc: "The jump from $20/night to $1,000/night isn't about getting better properties. It's about applying budget-level hustle to a luxury market where operators got complacent. The same service standards that feel normal at budget level become differentiation at luxury.",
  },
  {
    num: "02",
    title: "Your guests keep haggling on price",
    desc: "You're attracting the wrong guests. Price-focused guests reveal themselves in the first message. Filter by communication style, geography, and booking behavior. The right guests ask about the experience, not the cost.",
  },
  {
    num: "03",
    title: "Your partner keeps cutting corners",
    desc: "You can't tell upfront. Test with small deals and watch behavior. The cheapest chef, the unreliable driver, the 'don't worry' attitude about broken ACs. When philosophy mismatches, cut ties clean. No slow fade.",
  },
];

const starters = [
  "I want to get into luxury short-term rentals. Where do I start?",
  "How do I find reliable property partners without getting burned?",
  "I keep getting guests who haggle. How do I attract higher-value guests?",
  "How do I go from managing budget rooms to luxury villas?",
];

export default function LeonFreierPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <img
              src="/mentors/leon-freier.png"
              alt="Leon Freier"
              width={256}
              height={256}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border border-border-light shrink-0"
            />
            <div className="flex-1">
              <p className="text-amber text-sm font-semibold mb-2 tracking-wide uppercase">ForgeHouse Expert</p>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">Leon Freier</h1>
              <p className="text-muted text-lg md:text-xl leading-relaxed mb-2">
                Luxury Short-Term Rentals & Guest Experience
              </p>
              <p className="text-muted text-base leading-relaxed mb-6">
                An AI agent trained on 10 years of building a luxury villa portfolio in Vietnam from scratch.
                From $20/night rooms to $1,000+/night beachfront villas, with 350+ five-star reviews.
                Covers guest experience, property evaluation, partner management, and the hustle it takes to go from budget to luxury.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {highlights.map((h) => (
                  <div key={h.label} className="flex items-center gap-2 text-sm text-muted border border-glass-border rounded-full px-3.5 py-1.5">
                    <h.icon size={16} className="text-amber" />
                    {h.label}
                  </div>
                ))}
              </div>

              {/* Quote in hero */}
              <div className="pl-5 border-l-2 border-amber/20 mb-8">
                <p className="text-foreground/40 italic text-[14px] leading-relaxed">
                  &ldquo;Optimize for the guest experience and the review. You will build your business on positive reviews of you.&rdquo;
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/chat/leon-freier"
                  className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2"
                >
                  <ChatCircleDots size={20} />
                  Chat with his agent
                </Link>
                <a
                  href="https://www.airbnb.com/users/profile/1462809375056842073"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-glass-border text-muted px-5 py-3.5 rounded-xl font-semibold hover:text-foreground hover:border-white/20 transition text-center inline-flex items-center justify-center gap-2 text-sm"
                >
                  <Star size={18} />
                  View Airbnb Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sound familiar */}
      <section className="px-6 pt-10 pb-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">The problem</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Sound familiar?</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Operators come in with properties. They leave with a system that attracts the right guests and protects their reputation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <div key={s.num} className="flex flex-col gap-3">
                <span className="font-mono text-[13px] text-amber/60">{s.num}</span>
                <p className="font-semibold text-base">{s.title}</p>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/chat/leon-freier"
              className="text-amber text-[14px] hover:text-foreground transition"
            >
              Start with any of these &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How the agent thinks */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">The agent</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">How Leon&apos;s agent thinks</h2>
          <p className="text-muted text-base mb-10 max-w-2xl">
            Built from structured extraction sessions and a decade of operating in Vietnam.
            Not a chatbot with a hospitality prompt. A system that reasons from real experience.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Reviews over margin</p>
              <p className="text-muted text-sm">Will sacrifice short-term profit for a five-star review every time. Reviews compound. A single bad review costs more than the margin you saved.</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Diagnoses your situation</p>
              <p className="text-muted text-sm">Asks about your properties, your guests, and your current setup before giving any advice. Won&apos;t prescribe before understanding.</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-semibold mb-2 text-sm">Operator, not consultant</p>
              <p className="text-muted text-sm">Speaks from 10 years of doing, not teaching. Knows what works because he&apos;s tried what doesn&apos;t. Honest about what he hasn&apos;t figured out yet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Try it */}
      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Try it</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Get advice from a real operator</h2>
          <p className="text-muted text-base mb-10 max-w-xl mx-auto">
            Pick one, or describe your situation.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
            {starters.map((s) => (
              <Link
                key={s}
                href={`/chat/leon-freier?q=${encodeURIComponent(s)}`}
                className="glass-card p-4 text-sm text-left hover:border-amber/20 transition text-muted hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href="/chat/leon-freier"
            className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2"
          >
            <ChatCircleDots size={20} />
            Chat with his agent
          </Link>
          <p className="text-[11px] text-zinc-600 text-center mt-4">Your conversations are private. We don&apos;t sell or share your data.</p>
        </div>
      </section>
    </div>
  );
}
