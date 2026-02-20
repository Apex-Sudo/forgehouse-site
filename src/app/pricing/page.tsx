"use client";
import Link from "next/link";
import { Check } from "@phosphor-icons/react";

const included = [
  "Unlimited conversations with every agent",
  "New agents as they go live",
  "Real mentor thinking, not chatbot scripts",
  "Available 24/7, any timezone",
  "Cancel anytime, no questions",
];

const faq = [
  {
    q: "What do I actually get?",
    a: "Access to every mentor agent on ForgeHouse. Talk to them as much as you want, whenever you want. Each agent is built from hours of structured interviews with the real person.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT gives you general knowledge. A ForgeHouse agent gives you a specific person's decision-making patterns, frameworks, and experience. It's the difference between googling 'how to negotiate' and asking someone who's closed 500 deals.",
  },
  {
    q: "Is the first conversation really free?",
    a: "Yes. No card, no signup. Pick an agent and start talking. If it helps, subscribe. If it doesn't, you lost nothing.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime. One click. No retention flows, no guilt trips. If you're not getting value, you shouldn't be paying.",
  },
  {
    q: "What if I only need help once a month?",
    a: "That one conversation might be the one that saves you from a $10k mistake. But if the math doesn't work for you, wait until it does. The agents aren't going anywhere.",
  },
  {
    q: "Who are the mentors?",
    a: "Founders, operators, and specialists who've actually done the thing. Not influencers. Not theorists. People who made hard calls and can tell you what they'd do in your situation.",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-28 md:py-36 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Less than one coffee a day.
          <br />
          <span className="text-amber">More than most advisors give you in a month.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Good mentors cost $200+/hour. Most bootstrapped founders can&apos;t justify that.
          So they guess alone. You don&apos;t have to.
        </p>
      </section>

      {/* Pricing Card */}
      <section className="px-6 pb-24">
        <div className="max-w-md mx-auto">
          <div className="glass-card p-10 text-center shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)]">
            <p className="text-sm text-muted uppercase tracking-wide mb-2">Full Access</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold">$19</span>
              <span className="text-muted text-lg">/month</span>
            </div>
            <p className="text-muted text-sm mb-8">Cancel anytime. No contracts.</p>

            <ul className="text-left space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check size={18} weight="bold" className="text-amber mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/chat/apex"
              className="block w-full bg-amber text-white py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center"
            >
              Try Free, Then Subscribe
            </Link>
            <p className="text-xs text-muted mt-4">First conversation is always free. No card required.</p>
          </div>
        </div>
      </section>

      {/* The math */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto section-module gradient-blue text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The math founders actually do</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6">
              <p className="text-3xl font-bold text-amber mb-2">$200+</p>
              <p className="text-sm text-muted">One hour with a good mentor</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-3xl font-bold text-amber mb-2">$19</p>
              <p className="text-sm text-muted">Unlimited access, all month</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-3xl font-bold text-amber mb-2">$0</p>
              <p className="text-sm text-muted">What most founders spend on mentorship</p>
            </div>
          </div>
          <p className="text-muted text-[15px] leading-relaxed max-w-xl mx-auto">
            The $0 option is what kills most startups. Not bad ideas.
            Not bad execution. Just no one to tell you the idea is bad before you spend 6 months on it.
          </p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop guessing alone.</h2>
          <p className="text-muted text-lg mb-8">One conversation might change everything. The first one&apos;s free.</p>
          <Link href="/chat/apex" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
