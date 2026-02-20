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
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">🔺</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Apex</h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed mb-12">
          Trained by a founder who built companies across three continents.
          Apex doesn&apos;t give you advice. It gives you the question you should
          be asking before the one you&apos;re asking.
        </p>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-4">Capabilities</h2>
            <ul className="space-y-3">
              {capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 text-muted">
                  <span className="text-amber mt-0.5">▸</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-4">What it won&apos;t do</h2>
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

        <div className="border border-border bg-surface p-8 mb-12">
          <h3 className="text-sm font-mono text-amber uppercase tracking-wider mb-2">Pricing</h3>
          <p className="text-2xl font-bold mb-1">Free during beta</p>
          <p className="text-muted text-sm">Usage-based pricing coming soon</p>
        </div>

        <Link
          href="/chat/apex"
          className="inline-block bg-amber text-background px-10 py-4 font-semibold text-lg hover:bg-amber-dark transition"
        >
          Start conversation
        </Link>
      </section>
    </div>
  );
}
