import Link from "next/link";

export default function WeeklyOutboundPlan() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6">
      <article className="max-w-2xl mx-auto">
        <Link href="/thinking" className="text-sm text-muted/60 hover:text-muted transition mb-8 block">
          ← Thinking
        </Link>
        <time className="text-sm text-muted/60">March 2026</time>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8 leading-tight">
          How to Build an Outbound Plan You&apos;ll Actually Execute
        </h1>
        <div className="prose-fh">
          <p className="text-lg text-muted mb-8">
            The number one outbound failure mode isn&apos;t bad emails or wrong targeting. It&apos;s inconsistency. You send a burst of outreach when pipeline feels empty, then stop when client work picks up. Two weeks later, pipeline is dry again. Repeat forever.
          </p>

          <p>
            Feast-or-famine is the default for every founder doing their own sales. Not because they&apos;re lazy, but because outbound doesn&apos;t feel urgent until the pipeline is already empty. By then, you&apos;re three weeks behind.
          </p>

          <p>
            The fix isn&apos;t willpower. It&apos;s structure. A weekly plan that breaks outbound into daily tasks, calibrated to where your pipeline actually stands right now.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">The shape of a good week</h2>

          <p>
            Monday is research and list building. You&apos;re not sending anything yet. You&apos;re finding 20-30 people who match your ICP, looking at their recent activity, and noting one specific thing about each that you can reference in your outreach.
          </p>

          <p>
            Tuesday through Thursday is execution. New outreach goes out in the morning when open rates are highest. Follow-ups go out in the afternoon. LinkedIn engagement fills the gaps. Every day has a number: 15 new messages, 10 follow-ups, 5 LinkedIn comments. The numbers keep you honest.
          </p>

          <p>
            Friday is review. What got replies? What got ignored? Which subject lines worked? You adjust next week&apos;s plan based on what you learned this week. Without Friday review, you repeat the same mistakes every Monday.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Calibrate to your pipeline</h2>

          <p>
            The biggest mistake in outbound planning is using the same playbook regardless of pipeline state. If you have 10 active deals in various stages, blasting 25 new messages a day is wrong. You should be following up and closing.
          </p>

          <p>
            Empty pipeline: 80% new outreach, 20% follow-up. You need conversations before you need sequences.
          </p>

          <p>
            Healthy pipeline: 40% new outreach, 60% follow-up and nurture. Keep the top of funnel alive without neglecting deals that are already moving.
          </p>

          <p>
            Full pipeline: 20% new outreach, 80% closing and follow-up. Slow the new volume way down. You can&apos;t serve 15 active deals and prospect 25 new people simultaneously without dropping quality on both.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Why the breakup email matters</h2>

          <p>
            Most founders hate writing breakup emails because it feels like giving up. But the breakup is often the email that gets a reply.
          </p>

          <p>
            &quot;I tried reaching out a few times and I get it, the timing might not be right. I won&apos;t send another message. If things change, I&apos;m here.&quot; That&apos;s it.
          </p>

          <p>
            This works because it removes pressure. The prospect has been feeling guilty about not responding, and the breakup gives them permission to either reply honestly or let it go without awkwardness. A surprising number will reply with &quot;actually, let&apos;s talk next month.&quot;
          </p>

          <p>
            The other benefit: it cleans your pipeline. Deals that were never going to close get flushed out. What remains is real.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Volume targets for one person</h2>

          <p>
            If you&apos;re a solo founder doing sales alongside everything else, here&apos;s a realistic daily target: 15 new outreach messages, 10 follow-ups, and 5 LinkedIn engagements. That&apos;s about 90 minutes of focused work.
          </p>

          <p>
            Over a week, that&apos;s 75 new touches, 50 follow-ups, and 25 LinkedIn interactions. Enough to generate 3-5 real conversations per week if your targeting is right. Two months of that and your pipeline will look completely different.
          </p>

          <p>
            The key word is &quot;daily.&quot; Sending 75 emails on Monday and nothing the rest of the week doesn&apos;t work. Consistency compounds. Bursts don&apos;t.
          </p>

          <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-foreground font-medium mb-2">Get your plan for this week</p>
            <p className="text-muted text-sm mb-4">Tell us what you sell, who you sell to, and where your pipeline stands. Get a concrete Mon-Fri action plan. Free, no login.</p>
            <Link href="/tools/outbound-planner" className="text-amber hover:text-amber-dark transition font-medium">
              Plan my week →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
