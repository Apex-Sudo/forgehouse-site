import Link from "next/link";

export default function WhyColdEmailsFail() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6">
      <article className="max-w-2xl mx-auto">
        <Link href="/thinking" className="text-sm text-muted/60 hover:text-muted transition mb-8 block">
          ← Thinking
        </Link>
        <time className="text-sm text-muted/60">March 2026</time>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8 leading-tight">
          Why Your Cold Emails Don&apos;t Get Replies
        </h1>
        <div className="prose-fh">
          <p className="text-lg text-muted mb-8">
            You research a prospect, write something thoughtful, hit send, and get silence. Not even a &quot;not interested.&quot; The problem usually isn&apos;t your targeting or your subject line. It&apos;s the structure of the email itself.
          </p>

          <p>
            Most cold emails fail for the same three reasons. They open with &quot;I&quot; or &quot;We,&quot; they never name the actual problem, and they offer zero proof the sender understands anything about the recipient&apos;s situation.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">The three structural mistakes</h2>

          <p>
            First: opening with yourself. &quot;I saw your recent post about X&quot; or &quot;We help companies like yours with Y.&quot; The reader is scanning for one signal: is this spam? Starting with &quot;I&quot; or &quot;We&quot; confirms it. Delete.
          </p>

          <p>
            Second: no problem statement. You describe a solution without naming the pain. The prospect has to work backward to figure out if this is relevant to them. That&apos;s too much cognitive effort for an email from a stranger.
          </p>

          <p>
            Third: generic proof. &quot;We&apos;ve helped hundreds of companies grow&quot; could be from any company selling anything to anyone. If you could send the same email to 500 people by changing the first name, it&apos;s not personalized. It&apos;s a template with a merge field.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Problem, Impact, Proof</h2>

          <p>
            The fix is structural. Lead with their problem, show the business impact of leaving it unsolved, then prove you understand their specific context.
          </p>

          <p>
            Problem: &quot;Most sales teams spend 40% of their pipeline time on deals that were never going to close.&quot; Impact: &quot;That&apos;s your reps&apos; best hours burned on prospects who ghosted after the demo.&quot; Proof: &quot;I noticed you just expanded into enterprise accounts. That shift usually doubles the ghost rate in the first quarter.&quot;
          </p>

          <p>
            The proof line is the hardest. It has to be specific enough that the prospect pauses and thinks, &quot;How did they know that?&quot; If your proof could apply to any company in the industry, it&apos;s not proof.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Before and after</h2>

          <p>
            Before: &quot;Hi Sarah, I noticed you&apos;re scaling your sales team. We help companies optimize their outbound process. Would love to show you how we&apos;ve helped similar companies. Free to chat this week?&quot;
          </p>

          <p>
            After: &quot;Hiring 3 SDRs in Q1 usually means the first two months are a wash while they ramp. If you&apos;re trying to avoid the ramp tax, I built something that cuts onboarding from 8 weeks to 3. Worth 15 minutes to see if it fits?&quot;
          </p>

          <p>
            The second email starts with the recipient&apos;s problem, makes the cost concrete, and only mentions the product in service of the solution. It&apos;s about them until the last sentence.
          </p>

          <h2 className="text-xl font-semibold mt-12 mb-4">Personalization that scales</h2>

          <p>
            You can&apos;t deep-research 200 people. But you can research the pattern once and apply it to the segment.
          </p>

          <p>
            If you&apos;re targeting founders who just raised a Series A, you know the context: pressure to hit growth targets, cash but not unlimited time, probably hiring their first dedicated sales person. That shared context is your proof layer. You don&apos;t need a unique insight for each prospect. You need to show you know what month two of post-raise life feels like.
          </p>

          <p>
            One good segment insight, applied to 50 prospects, will outperform 50 individually &quot;personalized&quot; emails that all start with &quot;I saw your LinkedIn post about...&quot;
          </p>

          <div className="mt-12 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-foreground font-medium mb-2">Get your email torn apart</p>
            <p className="text-muted text-sm mb-4">Paste your cold email and get a line-by-line diagnosis plus a rewrite. Free, no login.</p>
            <Link href="/tools/cold-email-teardown" className="text-amber hover:text-amber-dark transition font-medium">
              Run the teardown →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
