import Link from "next/link";

const capabilities = [
  "Strategic decision framing",
  "First-principles breakdown of complex problems",
  "Founder-to-founder pattern matching",
  "Go/no-go analysis on opportunities",
  "Prioritization under resource constraints",
  "Blind spot identification",
];

const wontDo = [
  "Write your pitch deck for you",
  "Give you a 10-step plan with no context",
  "Tell you what you want to hear",
  "Replace your judgment. Only sharpen it",
];

export default function ApexPage() {
  return (
    <div className="pt-16">
      <section className="gradient-hero px-6 py-24 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">🔺</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Apex</h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed mb-12">
          Trained by a founder who built companies across three continents.
          Apex doesn&apos;t give you advice. It gives you the question you should
          be asking before the one you&apos;re asking.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8">
            <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-6">Capabilities</h2>
            <ul className="space-y-3">
              {capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 text-muted">
                  <span className="text-amber mt-0.5">▸</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-8">
            <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-6">What it won&apos;t do</h2>
            <ul className="space-y-3">
              {wontDo.map((w) => (
                <li key={w} className="flex items-start gap-3 text-muted">
                  <span className="text-muted mt-0.5">✕</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample Conversation */}
        <div className="glass-card p-8 mb-16 overflow-hidden">
          <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-8">Sample conversation</h2>
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-[#3B82F6] text-white px-4 py-3 text-sm leading-relaxed rounded-2xl">
                I&apos;m stuck between two GTM strategies. Should I go PLG or sales-led?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/[0.04] border border-white/[0.06] text-[#EDEDED] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                Wrong question. What does your buyer actually do when they hit your site? Do they self-serve or do they ask for a demo?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-[#3B82F6] text-white px-4 py-3 text-sm leading-relaxed rounded-2xl">
                Most ask for a demo.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/[0.04] border border-white/[0.06] text-[#EDEDED] px-4 py-3 text-sm leading-relaxed rounded-2xl">
                Then you don&apos;t have a GTM strategy question. You have a sales capacity question. PLG won&apos;t fix that.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 mb-12">
          <h3 className="text-sm font-mono text-amber uppercase tracking-wider mb-2">Pricing</h3>
          <p className="text-2xl font-bold mb-1">Free during beta</p>
          <p className="text-muted text-sm">Usage-based pricing coming soon</p>
        </div>

        <Link
          href="/chat/apex"
          className="inline-block bg-amber text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-amber-dark transition"
        >
          Start conversation
        </Link>
      </section>
    </div>
  );
}
