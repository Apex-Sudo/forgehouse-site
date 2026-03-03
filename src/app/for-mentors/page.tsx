import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

const steps = [
  { num: "01", title: "We talk.", desc: "2-3 conversations where you do what you already do: explain how you think about problems. We capture the patterns, the mental models, the stuff that takes years to learn." },
  { num: "02", title: "We build.", desc: "We turn that into an AI agent that actually sounds like you. Not a chatbot with your name on it. Your real thinking, tested until you'd trust it with a client." },
  { num: "03", title: "It works.", desc: "Your agent talks to people 24/7. They get the clarity they came for. You get reach, revenue, and leads you didn't have to chase." },
];

const whatYouDont = [
  "No content to create",
  "No tech to learn",
  "No customers to support",
  "No scheduling, invoicing, or admin",
  "No prompt engineering",
];

const whatYouDo = [
  "A few conversations with us (one-time)",
  "Review your agent until it feels right",
  "Share it with your network when you're ready",
  "Collect checks",
];

export default function ForMentorsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-32 md:py-44 max-w-4xl mx-auto text-center">
        <p className="text-amber font-mono text-sm tracking-widest uppercase mb-6">For Mentors</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          You keep answering the{" "}
          <span className="text-amber">same questions.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Your calendar is full. Your waitlist is growing. And the people who need your help the most can&apos;t get on a call. What if your thinking was available to them 24/7, without you being in the room?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2">
            Apply Now <IconArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* The problem, in their words */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">You already know this is true</h2>
          <div className="space-y-6 text-muted text-lg leading-relaxed">
            <p>Half your discovery calls are with people who aren&apos;t ready for you yet. They need the basics. Your basics. But your basics take an hour, and that hour could go to someone further along.</p>
            <p>Your best frameworks only reach the people who can afford your rate. Everyone else reads your posts, nods, and tries to figure it out alone.</p>
            <p>You&apos;ve thought about courses, templates, content products. But packaging your thinking into a static format feels wrong. Your value isn&apos;t in slides. It&apos;s in how you respond to someone&apos;s specific situation.</p>
            <p className="text-foreground font-semibold">That&apos;s exactly what we built ForgeHouse to do.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
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

      {/* What changes */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto section-module gradient-blue">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">What changes for you</h2>
          <div className="space-y-8 text-lg leading-relaxed">
            <div>
              <p className="text-foreground font-semibold mb-2">People stop falling through the cracks.</p>
              <p className="text-muted">The ones who can&apos;t afford your hourly rate, who are in the wrong timezone, who need help at 2 AM. Your agent handles them. Hundreds at a time.</p>
            </div>
            <div>
              <p className="text-foreground font-semibold mb-2">Your discovery calls get better.</p>
              <p className="text-muted">People who talk to your agent first show up prepared. They already understand your framework. They&apos;re ready for the real conversation.</p>
            </div>
            <div>
              <p className="text-foreground font-semibold mb-2">You earn from conversations you&apos;re not in.</p>
              <p className="text-muted">You set your price. You keep 75%. Every subscriber is revenue that doesn&apos;t require your time.</p>
            </div>
            <div>
              <p className="text-foreground font-semibold mb-2">Your best clients find you.</p>
              <p className="text-muted">Every agent conversation is a qualifying layer. The people who need the real you get referred directly to your calendar, pre-qualified and already speaking your language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue - inline, not cards */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The math</h2>
          <p className="text-muted text-lg mb-8 leading-relaxed">You set your mentor price. You keep 75%. At $150/month per subscriber:</p>
          <p className="text-lg leading-relaxed">
            <span className="text-foreground font-semibold">10 subscribers</span> <span className="text-muted">= $1,125/mo.</span>{" "}
            <span className="text-foreground font-semibold">25</span> <span className="text-muted">= $2,812.</span>{" "}
            <span className="text-foreground font-semibold">50</span> <span className="text-muted">= $5,625.</span>
          </p>
          <p className="text-muted text-sm mt-6">Platform fee ($47/mo) paid by subscriber, 100% to ForgeHouse. Your mentor fee is yours.</p>
        </div>
      </section>

      {/* What you do / don't do */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">Your part</h3>
              <ul className="space-y-4">
                {whatYouDo.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">Our part</h3>
              <ul className="space-y-4">
                {whatYouDont.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck size={20} className="text-amber mt-0.5 shrink-0" />
                    <span className="text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proof: Colin */}
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

      {/* IP + CTA merged */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted text-[15px] leading-relaxed mb-10">
            Your frameworks stay yours. We have a license to run the agent, not ownership of your IP. You can pull it anytime. Extraction recordings stay confidential.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to stop leaving reach on the table?</h2>
          <p className="text-muted text-lg mb-10 leading-relaxed">Limited spots. We handpick every mentor.</p>
          <Link href="/apply" className="bg-amber text-white px-10 py-4 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2 text-lg">
            Apply Now <IconArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
