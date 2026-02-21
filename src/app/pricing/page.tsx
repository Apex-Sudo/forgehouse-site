"use client";
import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

const included = [
  "Their real decision-making patterns",
  "Available 24/7, any language",
  "Gets sharper over time",
  "Cancel anytime",
];

const faq = [
  {
    q: "What do I get access to?",
    a: "A specific mentor's thinking, built from hours of real conversation. Not generic AI. Not a static course.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT gives general knowledge. A ForgeHouse agent gives you one person's decision-making. Like asking someone who's closed 500 deals vs googling it.",
  },
  {
    q: "Can I try before I subscribe?",
    a: "Talk to Apex. No card, no signup. Then decide.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime. One click.",
  },
  {
    q: "Why per mentor instead of one flat price?",
    a: "Different mentors, different expertise. You pay for what you need.",
  },
  {
    q: "Who are the mentors?",
    a: "Founders and operators who've done the work. No influencers, no theorists.",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-28 md:py-36 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          One live session&apos;s worth.
          <br />
          <span className="text-amber">Unlimited access to how they think.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          The most value you&apos;ll get from a single subscription.
        </p>
      </section>

      {/* Pricing Model */}
      <section className="px-6 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="glass-card p-10 text-center shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
            <p className="text-sm text-muted uppercase tracking-wide mb-4">Per Mentor Agent</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Unlimited conversations</h2>
            <p className="text-muted text-sm mb-8">for the price of one live session.</p>

            <ul className="text-left space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <IconCheck size={18} stroke={3} className="text-amber mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/chat/apex"
              className="block w-full bg-amber text-white py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center"
            >
              Try Apex Free
            </Link>
            <p className="text-xs text-muted mt-4">Every mentor sets their own price.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Common questions</h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="glass-card p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted text-[15px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">20 years of pattern recognition. On demand.</h2>
          <p className="text-muted text-lg mb-8">Every mentor on ForgeHouse earned their frameworks the hard way. Now those frameworks work for you, whenever you need them.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
