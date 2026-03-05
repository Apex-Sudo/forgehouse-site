import Link from "next/link";

export default function WhyDealsStall() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6">
      <article className="max-w-2xl mx-auto">
        <Link href="/thinking" className="text-sm text-muted/60 hover:text-muted transition mb-8 block">
          ← Thinking
        </Link>
        <time className="text-sm text-muted/60">March 2026</time>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8 leading-tight">
          The One Reason Your Deals Keep Stalling
        </h1>
        <div className="prose-fh">
          <p className="text-lg text-muted mb-8">
            Three deals stuck in &quot;evaluating&quot; for six weeks. You ask why and get three different answers: pricing, timing, internal alignment. You treat each one as a separate problem. That&apos;s the mistake.
          </p>

          <p>
            Founders take deal excuses at face value because it feels actionable. &quot;We lost on price&quot; gives you something to fix. But the stated reason is almost never the real reason. It&apos;s just the easiest thing for the prospect to say.
          </p>

          <p>
            When you line up three losses side by side, the pattern becomes obvious. And it&apos;s usually something that happened much earlier in the process than where the deal actually died.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">The deal autopsy</h2>

          <p>
            A deal autopsy asks three questions about each loss. Where in the pipeline did this deal actually die? Not where they told you it died, but where you lost control of the conversation.
          </p>

          <p>
            What was the stated reason? And then: what was the actual reason?
          </p>

          <p>
            &quot;Timing isn&apos;t right&quot; usually means you never created urgency. They don&apos;t have a reason to act now, so they don&apos;t. &quot;We went with a competitor&quot; means they couldn&apos;t tell the difference between you and the other option. &quot;Need to get buy-in from the team&quot; means you were talking to someone who can&apos;t say yes.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">The three patterns that kill pipelines</h2>

          <p>
            Pattern one: no urgency. The prospect likes what you do but has no reason to act this quarter. You gave a great demo and they said &quot;this is really cool&quot; and then nothing happened. Cool doesn&apos;t close deals. Pain closes deals.
          </p>

          <p>
            Pattern two: wrong stakeholder. You built a relationship with someone who was genuinely interested but couldn&apos;t sign the contract. They became your internal champion, except they had no budget authority and couldn&apos;t make the case to the person who does.
          </p>

          <p>
            Pattern three: the price objection that isn&apos;t about price. When someone says &quot;it&apos;s too expensive,&quot; they&apos;re usually saying &quot;I don&apos;t understand the value well enough to justify this cost.&quot; If you proved the ROI clearly, the price wouldn&apos;t be the blocker.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">One fix, not ten</h2>

          <p>
            The instinct after losing deals is to fix everything. Better demos, better pricing, better follow-up cadence. But scattered improvements don&apos;t compound. They dilute your focus.
          </p>

          <p>
            If two out of three losses died because you were talking to the wrong person, the fix isn&apos;t better demos. It&apos;s qualifying for decision-making authority in the first call. One change, applied consistently, saves more deals than five changes applied randomly.
          </p>

          <p>
            The hard part is being honest about the pattern. It&apos;s more comfortable to believe each deal failed for its own unique reason. It&apos;s less comfortable to accept that you&apos;re making the same structural mistake every time.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Dead deals vs. sleeping deals</h2>

          <p>
            Not every lost deal is actually dead. Some just need a different approach. The prospect who went silent after your proposal might re-engage if you come back with a case study that addresses their specific objection.
          </p>

          <p>
            But the prospect who chose a competitor six months ago? That&apos;s dead. Chasing it wastes time you could spend on new pipeline. Knowing the difference is part of the diagnosis.
          </p>

          <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-foreground font-medium mb-2">Find the pattern in your pipeline</p>
            <p className="text-muted text-sm mb-4">Describe your last 3 lost deals and get a diagnosis with the one fix that saves the most. Free, no login.</p>
            <Link href="/tools/pipeline-diagnosis" className="text-amber hover:text-amber-dark transition font-medium">
              Run the diagnosis →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
