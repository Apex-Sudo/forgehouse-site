"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
    a: "A specific expert's thinking, built from hours of real conversation. Not generic AI. Not a static course.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT gives general knowledge. A ForgeHouse module gives you one person's decision-making. Like asking someone who's closed 500 deals vs googling it.",
  },
  {
    q: "Can I try before I subscribe?",
    a: "5 free messages with Colin. No card, no signup. Then decide.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime. One click.",
  },
  {
    q: "Why per module instead of one flat price?",
    a: "Different experts, different expertise. You pay for what you need.",
  },
  {
    q: "Who are the experts?",
    a: "Founders and operators who've done the work. No influencers, no theorists.",
  },
  {
    q: "How are the agents trained?",
    a: "Through structured extraction sessions with the real expert. Hours of conversation, scenario calibration, and voice tuning. Not book summaries. Not scraped content. Their actual decision-making, captured first-hand.",
  },
  {
    q: "Is this a replacement for live coaching?",
    a: "No. Live coaching is irreplaceable for reading the room and emotional accountability. This extends the expert between sessions. The 8,748 hours per year when your coach isn't available.",
  },
  {
    q: "What kind of questions can I ask?",
    a: "Anything you'd bring to a real session. Pipeline diagnosis, messaging review, ICP definition, deal strategy, hiring decisions. The module reasons through your situation the way the expert would.",
  },
  {
    q: "How accurate is the agent compared to the real mentor?",
    a: "Every module goes through live calibration where the expert reviews and corrects what's off. It's not perfect. But it's trained on how they actually think, not a generic prompt.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

function SubscribeButton() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (status === "loading") return;
    setError(null);

    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorSlug: "colin-chapman" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="block w-full bg-amber text-white py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Loading..." : "Start with Colin · $48/mo"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
      <div className="mt-3 text-xs text-muted text-center space-y-0.5">
        <p>ForgeHouse Platform $47/mo + Colin Chapman $1/mo</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
          <div className="glass-card p-10 text-center shadow-[0_0_24px_rgba(184,145,106,0.12)] border-[rgba(184,145,106,0.2)]">
            <p className="text-sm text-muted uppercase tracking-wide mb-2">Colin Chapman</p>
            <div className="text-5xl font-bold mb-1">$48<span className="text-lg font-normal text-muted">/month</span></div>
            <p className="text-muted text-sm mb-8">Unlimited conversations with Colin&apos;s AI mentor agent.</p>

            <ul className="text-left space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <IconCheck size={18} stroke={3} className="text-amber mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <SubscribeButton />
            <Link
              href="/chat/colin-chapman"
              className="block w-full mt-3 text-center text-sm text-muted hover:text-foreground transition"
            >
              or try 5 free messages first →
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Make your agent more effective.</h2>
          <p className="text-muted text-lg mb-8">Reduce the work. Not the expertise.</p>
          <Link href="/chat/colin-chapman" className="bg-amber text-background px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition inline-block">
            Try Colin — 5 Free Messages
          </Link>
        </div>
      </section>
    </div>
  );
}
