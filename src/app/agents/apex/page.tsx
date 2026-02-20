import Link from "next/link";

const capabilities = [
  "Reframe the decision so you're solving the right problem",
  "Find the blind spot that's costing you months",
  "Pattern-match from real founder experience",
  "Pressure-test your reasoning before you bet on it",
  "Cut through urgency to find what actually matters first",
  "Say the thing your team won't tell you",
];

const wontDo = [
  "Write your pitch deck for you",
  "Give you a 10-step plan without knowing your situation",
  "Tell you what you want to hear",
  "Replace your judgment. Only sharpen it",
];

export default function ApexPage() {
  return (
    <div className="pt-16">
      <section className="gradient-hero px-6 py-24 max-w-3xl mx-auto text-center">
        <div className="text-6xl mb-6">🔺</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Apex</h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed mb-12 max-w-2xl mx-auto">
          Won&apos;t tell you what to do. Will find the blind spot you&apos;re missing.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16 text-left">
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
        <p className="text-sm text-muted/60 uppercase tracking-wider text-center mb-4">See it in action</p>
        <div className="glass-card p-10 md:p-12 mb-16 overflow-hidden text-left shadow-[0_0_24px_rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.2)] max-w-3xl mx-auto relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#3B82F6]/40 before:to-transparent">
          <h2 className="text-sm font-mono text-amber uppercase tracking-wider mb-10 text-center">Sample conversation</h2>
          <div className="space-y-6">
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-[#3B82F6] text-white px-5 py-3.5 text-sm leading-relaxed rounded-2xl">
                I&apos;m stuck between two GTM strategies. Should I go PLG or sales-led?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[75%] bg-white/[0.04] border border-white/[0.06] text-[#EDEDED] px-5 py-3.5 text-sm leading-relaxed rounded-2xl">
                Wrong question. What does your buyer actually do when they hit your site? Do they self-serve or do they ask for a demo?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[75%] bg-[#3B82F6] text-white px-5 py-3.5 text-sm leading-relaxed rounded-2xl">
                Most ask for a demo.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[75%] bg-white/[0.04] border border-white/[0.06] text-[#EDEDED] px-5 py-3.5 text-sm leading-relaxed rounded-2xl">
                Then you don&apos;t have a GTM strategy question. You have a sales capacity question. PLG won&apos;t fix that.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 mb-12 text-center">
          <h3 className="text-sm font-mono text-amber uppercase tracking-wider mb-2">Pricing</h3>
          <p className="text-2xl font-bold mb-1">Free forever</p>
          <p className="text-muted text-sm">The house agent. Always free.</p>
        </div>

        <div className="text-center">
          <Link
            href="/chat/apex"
            className="inline-block bg-amber text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-amber-dark transition"
          >
            Talk to Apex
          </Link>
        </div>
      </section>
    </div>
  );
}
