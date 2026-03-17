"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconCheck } from "@tabler/icons-react";

const included = [
  "His real decision-making patterns",
  "Available 24/7, any language",
  "Personally approved by Colin",
  "Cancel anytime",
];

const faq = [
  {
    q: "What do I get access to?",
    a: "Colin's actual thinking, built from hours of real conversation with him. His frameworks, his judgment calls, his way of diagnosing a pipeline. Available as a chat or through your AI agent via API.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT gives general knowledge. Colin's agent gives you one person's decision-making. Like asking someone who's closed 500 deals vs. googling it.",
  },
  {
    q: "Can I try before I subscribe?",
    a: "5 free messages with Colin's agent. No card, no signup. Then decide.",
  },
  {
    q: "Can I cancel?",
    a: "Anytime. One click.",
  },
  {
    q: "Who is Colin Chapman?",
    a: "26 years in B2B sales, GTM, and outbound. He's worked with companies like IBM, Siemens, and BMW. 4.92-rated mentor on GrowthMentor. A real person whose expertise we turned into an AI agent.",
  },
  {
    q: "How is the agent built?",
    a: "Through structured extraction sessions with Colin himself. Hours of conversation, scenario calibration, and voice tuning. His actual decision-making, captured first-hand.",
  },
  {
    q: "Is this a replacement for live coaching?",
    a: "It extends the expert between sessions. Live coaching is great for reading the room and accountability. This covers the 8,748 hours per year when your coach isn't available.",
  },
  {
    q: "What kind of questions can I ask?",
    a: "Anything you'd bring to a real session. Pipeline diagnosis, messaging review, ICP definition, deal strategy, hiring decisions. The agent reasons through your situation the way Colin would.",
  },
  {
    q: "How accurate is the agent?",
    a: "Colin reviews and approves the agent himself. It's trained on how he actually thinks, and he personally calibrates every response pattern.",
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
          A shortcut to knowledge
          <br />
          <span className="text-amber">you&apos;d spend months acquiring.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Skip the learning curve. Get the expertise.
        </p>
      </section>

      {/* Pricing Model */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-stretch justify-center gap-0">
          {/* Free tier — slightly behind, offset left */}
          <div className="glass-card p-8 text-center flex flex-col w-full md:w-[340px] md:-mr-6 md:mt-8 md:mb-8 relative z-0 opacity-90">
            <p className="text-sm text-muted uppercase tracking-wide mb-2">Try it</p>
            <div className="text-4xl font-bold mb-1">Free</div>
            <p className="text-muted text-sm mb-6">5 messages with Colin. No card, no signup.</p>

            <ul className="text-left space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm">
                <IconCheck size={16} stroke={3} className="text-amber mt-0.5 shrink-0" />
                <span className="text-foreground/90">5 free messages</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <IconCheck size={16} stroke={3} className="text-amber mt-0.5 shrink-0" />
                <span className="text-foreground/90">No account required</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <IconCheck size={16} stroke={3} className="text-amber mt-0.5 shrink-0" />
                <span className="text-foreground/90">Full module, not a teaser</span>
              </li>
            </ul>

            <Link
              href="/chat/colin-chapman"
              className="block w-full bg-foreground/10 text-foreground py-3.5 rounded-xl font-semibold hover:bg-foreground/20 transition text-center"
            >
              Try Colin free →
            </Link>
          </div>

          {/* Paid tier — center, elevated */}
          <div className="bg-white p-10 text-center shadow-[0_4px_40px_rgba(0,0,0,0.08)] border-2 border-amber/30 rounded-2xl flex flex-col w-full md:w-[400px] relative z-10">
            <p className="text-sm text-amber uppercase tracking-wide font-semibold mb-2">Colin Chapman</p>
            <div className="text-5xl font-bold mb-1">$48<span className="text-lg font-normal text-muted">/month</span></div>
            <p className="text-muted text-[15px] mb-8">Unlimited conversations with Colin&apos;s AI agent. Built from 26 years of real deal-making.</p>

            <ul className="text-left space-y-4 mb-10 flex-1">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]">
                  <IconCheck size={18} stroke={3} className="text-amber mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <SubscribeButton />
            
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
