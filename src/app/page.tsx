import Link from "next/link";
import AgentCard from "@/components/AgentCard";

const steps = [
  { num: "01", title: "Browse agents", desc: "Each one trained by a real founder with real scars." },
  { num: "02", title: "Start a conversation", desc: "No prompts needed. Just tell it what you're working on." },
  { num: "03", title: "Get sharper decisions", desc: "Not answers. Better questions. Faster clarity." },
];

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="px-6 py-32 md:py-44 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Where agents are <span className="text-amber">forged</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Not task-runners. Decision-making partners trained by real founders.
          Each agent carries the pattern recognition of someone who&apos;s built, failed, and built again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/agents" className="bg-amber text-background px-8 py-3 font-semibold hover:bg-amber-dark transition text-center">
            Browse Agents
          </Link>
          <Link href="/chat/apex" className="border border-border px-8 py-3 font-semibold hover:border-amber/40 transition text-center">
            Try Apex Now
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s) => (
              <div key={s.num}>
                <span className="text-amber font-mono text-sm">{s.num}</span>
                <h3 className="text-xl font-bold mt-2 mb-3">{s.title}</h3>
                <p className="text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured agent */}
      <section className="px-6 py-24 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Featured agent</h2>
          <p className="text-muted mb-12">The first. More are being forged.</p>
          <div className="max-w-sm">
            <AgentCard
              name="Apex"
              emoji="🔺"
              tagline="Trained by a founder who built across three continents. Doesn't give advice — gives you the right question."
              tags={["Strategy", "Decision-Making", "Founder Ops"]}
              price="Free during beta"
              href="/agents/apex"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 border-t border-border text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop asking for answers.<br />Start asking better questions.</h2>
        <Link href="/chat/apex" className="inline-block bg-amber text-background px-10 py-4 font-semibold text-lg hover:bg-amber-dark transition">
          Talk to Apex
        </Link>
      </section>
    </div>
  );
}
