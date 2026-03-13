import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconCheck, IconMessageCircle, IconBrush, IconHeadset, IconReceipt, IconMicrophone, IconEyeCheck, IconShare, IconCash } from "@tabler/icons-react";

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

const yourPart = [
  { icon: IconMicrophone, text: "A few conversations with us (one-time)" },
  { icon: IconEyeCheck, text: "Review your agent until it feels right" },
  { icon: IconShare, text: "Share it with your network when you're ready" },
  { icon: IconCash, text: "Collect checks" },
];

const ourPart = [
  { icon: IconBrush, text: "We create all the content" },
  { icon: IconMessageCircle, text: "We handle the tech" },
  { icon: IconHeadset, text: "We support your subscribers" },
  { icon: IconReceipt, text: "We manage billing, scheduling, and admin" },
];

export default function ForMentorsPage() {
  return (
    <div className="pt-16">
      {/* 1. Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <p className="text-amber font-mono text-sm tracking-widest uppercase mb-6">For Mentors</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-10">
          The people who need you most{" "}
          <span className="text-amber">will never book a call.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          What if they didn&apos;t have to?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2">
            Apply Now <IconArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto section-module" style={{ padding: "3rem" }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">You already know this is true</h2>
          <div className="space-y-6 text-[15px] text-muted/80 leading-relaxed">
            <p><strong className="text-foreground">A whole generation of founders would rather talk to an AI than schedule a video call with a stranger.</strong> It&apos;s not that they don&apos;t value your expertise. The friction of booking, showing up, and asking &ldquo;dumb questions&rdquo; in front of someone senior stops them before they start.</p>
            <p>You&apos;ve tried training people on what you do. You thought it was simple. Then you realized just how much of your thinking runs on autopilot, how many things you factor in without noticing. <strong className="text-foreground">The curse of knowledge: once you know how to ride the bike, you can&apos;t remember what it felt like not to.</strong></p>
            <p>Courses don&apos;t capture it. Templates don&apos;t capture it. Even a two-hour training session only gets the surface. <strong className="text-foreground">Your real value is in how you respond to a specific situation, not in slides.</strong></p>
          </div>
          <p className="text-foreground font-semibold text-lg mt-10 text-center">That&apos;s exactly what we built ForgeHouse to do.</p>
        </div>
      </section>

      {/* 3. How it works */}
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

      {/* 4. Proof: Colin */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto section-module">
          <p className="text-amber font-mono text-sm tracking-widest uppercase mb-6 text-center">First Mentor Live</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Colin Chapman</h2>
          <p className="text-muted text-lg text-center mb-8 leading-relaxed">
            GTM Strategy &amp; Outbound Sales · 26 years experience · 4.92★ on GrowthMentor
          </p>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Status</p>
              <p className="font-semibold">Live on ForgeHouse</p>
            </div>
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Platform</p>
              <p className="font-semibold">$47/mo per subscriber</p>
            </div>
            <div>
              <p className="text-sm text-muted uppercase tracking-wide mb-1">Mentor Cost</p>
              <p className="font-semibold">Free at launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Colin Testimonial */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10">
            <p className="text-[16px] text-muted leading-relaxed italic mb-6">&ldquo;When Leon first pitched me on this, I wasn&apos;t sure an AI could capture how I actually think about sales. I&apos;ve spent 26 years doing this, and most of what I do is instinct at this point. But the process surprised me. <strong className="text-foreground not-italic">It forced me to articulate things I&apos;d been doing on autopilot for decades</strong>, and <strong className="text-foreground not-italic">the output captured my thinking better than I anticipated</strong>. Is it the same as talking to me? No. But for founders who are stuck on outreach and don&apos;t know where to start, <strong className="text-foreground not-italic">it gets them pointed in the right direction with the right fundamentals</strong>. I&apos;m happy to put my name on it.&rdquo;</p>
            <div className="flex items-center gap-3">
              <Image src="/mentors/colin-chapman.png" alt="Colin Chapman" width={40} height={40} className="rounded-[10px] object-cover" />
              <div>
                <p className="text-sm font-semibold">Colin Chapman</p>
                <p className="text-xs text-muted">GTM &amp; Outbound Sales · 26 years · First ForgeHouse Mentor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What changes for you */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">What changes for you</h2>
          <div className="divide-y divide-border">
            <div className="py-8 first:pt-0">
              <p className="text-foreground font-semibold mb-2">Your waitlist stops growing.</p>
              <p className="text-muted leading-relaxed">The ones who can&apos;t afford your hourly rate, who are in the wrong timezone, who need help at 2 AM. Your agent handles them. Hundreds at a time. Nobody waits.</p>
            </div>
            <div className="py-8">
              <p className="text-foreground font-semibold mb-2">Your discovery calls get better.</p>
              <p className="text-muted leading-relaxed">People who talk to your agent first show up prepared. They already understand your framework. They&apos;re ready for the real conversation.</p>
            </div>
            <div className="py-8">
              <p className="text-foreground font-semibold mb-2">You earn from conversations you&apos;re not in.</p>
              <p className="text-muted leading-relaxed">You set your price. You keep 75%. Every subscriber is revenue that doesn&apos;t require your time.</p>
            </div>
            <div className="py-8">
              <p className="text-foreground font-semibold mb-2">Your best clients find you.</p>
              <p className="text-muted leading-relaxed">Every agent conversation is a qualifying layer. The people who need the real you get referred directly to your calendar, pre-qualified and already speaking your language.</p>
            </div>
            <div className="py-8 last:pb-0">
              <p className="text-foreground font-semibold mb-2">Your live practice grows, not shrinks.</p>
              <p className="text-muted leading-relaxed">The agent proves your methodology works. People experience your thinking, see results, and want the real thing. It creates demand for you, not a substitute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Anti-commoditization */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">This doesn&apos;t replace you. It proves you.</h2>
          <div className="space-y-6 text-[15px] text-muted/80 leading-relaxed">
            <p>ChatGPT already gives generic advice in your field. Anyone can get a textbook answer for free. What they can&apos;t get is <span className="text-foreground font-medium">your</span> version. Your frameworks, your pattern recognition, the way you think about problems after doing this for a decade.</p>
            <p>That&apos;s what makes your agent valuable, and that&apos;s what makes you irreplaceable. The generic version already exists. Your version doesn&apos;t, until you build it here.</p>
            <p className="text-foreground/60 text-sm">Your knowledge stays in our system, never in theirs. AI providers are contractually prohibited from using API data for model training. Your IP is yours.</p>
          </div>
        </div>
      </section>

      {/* 8. Revenue */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The math</h2>
          <p className="text-muted text-lg mb-8 leading-relaxed">Subscribers pay two fees: a $47/mo platform fee (goes to ForgeHouse) and your mentor fee (you keep 75%). You set your price. At $150/mo mentor fee:</p>
          <p className="text-lg leading-relaxed">
            <span className="text-foreground font-semibold">10 subscribers</span> <span className="text-muted">= $1,125/mo to you.</span>{" "}
            <span className="text-foreground font-semibold">25</span> <span className="text-muted">= $2,812.</span>{" "}
            <span className="text-foreground font-semibold">50</span> <span className="text-muted">= $5,625.</span>
          </p>
        </div>
      </section>

      {/* 9. Your part / Our part */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">Your part</h3>
              <ul className="space-y-5">
                {yourPart.map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">Our part</h3>
              <ul className="space-y-5">
                {ourPart.map((item) => (
                  <li key={item.text} className="flex items-start gap-4">
                    <item.icon size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. IP + CTA */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted text-[15px] leading-relaxed mb-10">
            Your frameworks stay yours. We have a license to run the agent, not ownership of your IP. You can pull it anytime. All recordings stay confidential.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to stop leaving reach on the table?</h2>
          <p className="text-muted text-lg mb-10 leading-relaxed">One voice per domain. We work with 10 mentors per vertical, handpicked.</p>
          <Link href="/apply" className="bg-amber text-white px-10 py-4 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2 text-lg">
            Apply Now <IconArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
