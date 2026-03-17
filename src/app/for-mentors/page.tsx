import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconMicrophone, IconEyeCheck, IconShare, IconCash, IconBrush, IconMessageCircle, IconHeadset, IconReceipt } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "For Mentors — Turn Your Expertise Into a 24/7 AI Agent | ForgeHouse",
  description: "Your thinking, available anytime. We build an AI agent from your real expertise. You earn revenue while you sleep.",
  openGraph: {
    title: "For Mentors — Turn Your Expertise Into a 24/7 AI Agent",
    description: "Your thinking, available anytime. We build an AI agent from your real expertise. You earn revenue while you sleep.",
    url: "https://forgehouse.io/for-mentors",
  },
};

const steps = [
  { num: "01", title: "We talk.", desc: "2-3 conversations where you do what you already do: explain how you think about problems. We capture the patterns, the mental models, the stuff that takes years to learn." },
  { num: "02", title: "We build.", desc: "We turn that into an AI agent that actually sounds like you. Not a chatbot with your name on it. Your real thinking, tested until you'd trust it with a client." },
  { num: "03", title: "It works.", desc: "Your agent talks to people 24/7. They get the clarity they came for. You get reach, revenue, and leads you didn't have to chase." },
];

export default function ForMentorsPage() {
  return (
    <div className="mentors-light pt-16">
      {/* 1. Hero */}
      <section className="mentors-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <p className="mentors-accent font-mono text-sm tracking-widest uppercase mb-6">For Mentors</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-10">
          The people who need you most{" "}
          <span className="mentors-accent">will never book a call.</span>
        </h1>
        <p className="mentors-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          What if they didn&apos;t have to?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="mentors-cta px-8 py-3.5 rounded-xl font-semibold transition text-center inline-flex items-center justify-center gap-2">
            Apply Now <IconArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto mentors-module" style={{ padding: "3rem" }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">You already know this is true</h2>
          <div className="space-y-6 text-[15px] mentors-body leading-relaxed">
            <p><strong className="mentors-fg">A whole generation grew up on WhatsApp, not waiting rooms.</strong> They want instant, faceless answers on their phone at 2 AM. Not a Calendly link. Not a 30-minute video call with someone they&apos;ve never met. The friction of scheduling, showing up, and asking &ldquo;dumb questions&rdquo; in front of someone senior stops them before they start.</p>
            <p><strong className="mentors-fg">This isn&apos;t a temporary shift. It&apos;s how an entire generation communicates.</strong> They&apos;ll text a stranger before they&apos;ll book a call with an expert. Your expertise hasn&apos;t lost value. The delivery model has.</p>
            <p>Courses don&apos;t capture it. Templates don&apos;t capture it. Even a two-hour training session only gets the surface. <strong className="mentors-fg">Your real value is in how you respond to a specific situation, not in slides.</strong></p>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16 text-center">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="mentors-card p-8">
                <span className="mentors-accent font-mono text-sm">{s.num}</span>
                <h3 className="text-xl font-bold mt-3 mb-3">{s.title}</h3>
                <p className="mentors-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Colin testimonial */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mentors-card p-10">
            <p className="text-[16px] mentors-body leading-relaxed italic mb-6">&ldquo;When Leon first pitched me on this, I wasn&apos;t sure an AI could capture how I actually think about sales. I&apos;ve spent 26 years doing this, and most of what I do is instinct at this point. But the process surprised me. <strong className="mentors-fg not-italic">It forced me to articulate things I&apos;d been doing on autopilot for decades</strong>, and <strong className="mentors-fg not-italic">the output captured my thinking better than I anticipated</strong>. Is it the same as talking to me? No. But for founders who are stuck on outreach and don&apos;t know where to start, <strong className="mentors-fg not-italic">it gets them pointed in the right direction with the right fundamentals</strong>. I&apos;m happy to put my name on it.&rdquo;</p>
            <div className="flex items-center gap-3">
              <Image src="/mentors/colin-chapman.png" alt="Colin Chapman" width={40} height={40} className="rounded-[10px] object-cover" />
              <div>
                <p className="text-sm font-semibold">Colin Chapman</p>
                <p className="text-xs mentors-muted">GTM &amp; Outbound Sales · 26 years · First ForgeHouse Mentor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Your part / Our part */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="mentors-card p-8">
              <h3 className="text-xl font-bold mb-6">Your part</h3>
              <ul className="space-y-5">
                {[
                  { icon: IconMicrophone, text: "A few conversations with us (one-time)" },
                  { icon: IconEyeCheck, text: "Review your agent until it feels right" },
                  { icon: IconShare, text: "Share it with your network when you're ready" },
                  { icon: IconCash, text: "Collect checks" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={20} className="mentors-icon mt-0.5 shrink-0" />
                    <span className="mentors-muted leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mentors-card p-8">
              <h3 className="text-xl font-bold mb-6">Our part</h3>
              <ul className="space-y-5">
                {[
                  { icon: IconBrush, text: "We create all the content" },
                  { icon: IconMessageCircle, text: "We handle the tech" },
                  { icon: IconHeadset, text: "We support your subscribers" },
                  { icon: IconReceipt, text: "We manage billing, scheduling, and admin" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={20} className="mentors-icon mt-0.5 shrink-0" />
                    <span className="mentors-muted leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The math */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">The math</h2>
          <p className="mentors-muted text-lg mb-12 text-center leading-relaxed max-w-2xl mx-auto">
            Subscribers pay a $47/mo platform fee (ForgeHouse) plus your mentor fee (you keep 75%). You set your price.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="mentors-card p-6">
              <p className="text-2xl font-bold">10</p>
              <p className="text-sm mentors-muted">subscribers</p>
              <p className="mentors-accent font-semibold mt-1">$1,125/mo</p>
            </div>
            <div className="mentors-card p-6">
              <p className="text-2xl font-bold">25</p>
              <p className="text-sm mentors-muted">subscribers</p>
              <p className="mentors-accent font-semibold mt-1">$2,812/mo</p>
            </div>
            <div className="mentors-card p-6">
              <p className="text-2xl font-bold">50</p>
              <p className="text-sm mentors-muted">subscribers</p>
              <p className="mentors-accent font-semibold mt-1">$5,625/mo</p>
            </div>
          </div>

          <p className="mentors-muted text-xs text-center mt-6" style={{ opacity: 0.5 }}>Based on $150/mo mentor fee example. You set your own price.</p>
        </div>
      </section>

      {/* 7. First customer proof */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mentors-card p-10">
            <p className="text-[16px] mentors-body leading-relaxed mb-4">Our first paying customer is a technical founder building AI products. He uses ForgeHouse as his sales knowledge module. When offered direct access to the human mentor behind the agent, he declined.</p>
            <p className="mentors-fg font-semibold text-lg">&ldquo;I prefer the agent. It&apos;s a shortcut to the knowledge I need, available when I need it.&rdquo;</p>
            <p className="mentors-muted text-sm mt-4" style={{ opacity: 0.6 }}>He pays $48/mo. He chose the agent over the human. That&apos;s the shift.</p>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to stop leaving reach on the table?</h2>
          <p className="mentors-muted text-lg mb-4 leading-relaxed">One voice per domain. We work with 10 mentors per vertical, handpicked.</p>
          <p className="mentors-muted text-sm mb-10" style={{ opacity: 0.5 }}>
            Your frameworks stay yours. We license to operate, not to own. You can pull it anytime.
          </p>
          <Link href="/apply" className="mentors-cta px-10 py-4 rounded-xl font-semibold transition inline-flex items-center gap-2 text-lg">
            Apply Now <IconArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
