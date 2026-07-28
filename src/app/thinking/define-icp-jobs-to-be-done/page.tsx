import Link from "next/link";
import ClipButton from "@/components/ui/ClipButton";

export default function DefineICPJobsToBeDone() {
  return (
    <main className="pt-16 md:pt-[72px]">
      <article className="px-6 pt-14 md:pt-20 pb-24">
        <div className="max-w-[720px] mx-auto">
          <Link
            href="/thinking"
            className="mono text-[11px] tracking-[0.06em] uppercase text-muted hover:text-accent transition inline-block mb-10"
          >
            ← Thinking
          </Link>

          <time className="mono text-[11px] tracking-[0.06em] uppercase text-faint block">
            March 2026
          </time>
          <h1 className="text-[40px] md:text-[56px] leading-[0.95] tracking-[-0.015em] mt-5">
            How to Define Your ICP When You Don&apos;t Have 100 Customers
          </h1>
          <p className="mt-6 text-[19px] leading-[1.5] text-muted">
            Most ICP exercises produce something too vague to act on. &quot;B2B SaaS companies with 50-200 employees&quot; describes half the companies on LinkedIn. That&apos;s not targeting. That&apos;s hoping.
          </p>

          <div className="mt-10 mb-10 h-px bg-border" />

          <div className="prose-fh">
            <p>
              The problem is that most frameworks start with demographics. Job title, company size, industry. Those tell you who someone is on paper, not what they actually need.
            </p>

            <p>
              A VP of Sales at a Series A startup and a VP of Sales at a company about to IPO have the same title and completely different problems. One is trying to build from nothing. The other is trying not to break what already works.
            </p>

            <h2>Demographics describe people. Jobs explain purchases.</h2>

            <p>
              Jobs-to-be-Done flips the question. Instead of &quot;who is our customer?&quot; you ask &quot;what are they trying to accomplish when they buy this?&quot;
            </p>

            <p>
              Every purchase has three layers. The functional job: the task that needs doing. The social job: how buying this makes them look to their team, their boss, their board. The emotional job: the feeling they&apos;re chasing or the anxiety they&apos;re trying to kill.
            </p>

            <p>
              Most founders only think about the functional layer. That&apos;s why their messaging sounds like a feature list instead of something the buyer recognizes from their own life.
            </p>

            <h2>What this looks like in practice</h2>

            <p>
              Say you sell a reporting tool for sales teams. The functional job is &quot;see which deals are at risk before the end of quarter.&quot; Straightforward.
            </p>

            <p>
              The social job: &quot;Walk into the board meeting looking like I have complete visibility into my pipeline.&quot; The emotional job: &quot;Stop waking up Sunday night wondering if we&apos;re going to miss the number.&quot;
            </p>

            <p>
              When you write your cold email or landing page, you&apos;re not selling a dashboard. You&apos;re selling the feeling of walking into that meeting prepared. The buyer who feels that pain will recognize themselves in your copy immediately.
            </p>

            <h2>You don&apos;t need 100 customers to do this</h2>

            <p>
              Three to five real conversations will get you most of the way. Talk to people who match your hypothesis and ask two questions:
            </p>

            <p>
              &quot;What were you doing when you realized you needed something like this?&quot; This gets you the trigger event and the functional job.
            </p>

            <p>
              &quot;What would happen if you didn&apos;t solve this?&quot; This gets you the stakes, which reveals the emotional and social jobs.
            </p>

            <p>
              When three different people use the same phrase to describe their situation, put that phrase in your messaging. Their words convert better than yours because buyers trust language that sounds like their own thinking.
            </p>

            <h2>From jobs to targeting</h2>

            <p>
              Once you know the job, reverse-engineer who has it right now. Not &quot;all VPs of Sales.&quot; Specifically: VPs who got promoted in the last 6 months at companies that raised a Series A this year. That person has the job. You can find them on LinkedIn in 10 minutes.
            </p>

            <p>
              Your ICP stops being a guess and starts being a filter. You&apos;re not hoping they have the problem. You know they do because the job exists in that context.
            </p>
          </div>

          <div className="mt-16 bg-surface border border-border rounded-lg p-8">
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-accent mb-3">
              Next step
            </p>
            <h2 className="text-[30px] leading-[1.05]">Build yours in 60 seconds</h2>
            <p className="mt-3 text-[16px] leading-[1.55] text-muted">
              The ICP Diagnostic uses the JTBD framework to define your ideal customer. Free, no login.
            </p>
            <div className="mt-6 max-w-[320px]">
              <ClipButton href="/tools/icp-diagnostic" variant="paper">
                Run the diagnostic
              </ClipButton>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
