import Link from "next/link";

export default function ExecutiveCoachingCostPost() {
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
            February 2026
          </time>
          <h1 className="text-[40px] md:text-[56px] leading-[0.95] tracking-[-0.015em] mt-5">
            Executive Coaching Costs $300/Hour. Here's What You're Actually
            Paying For.
          </h1>
          <p className="mt-6 text-[19px] leading-[1.5] text-muted">
            The price isn't the problem. The structure is.
          </p>

          <div className="mt-10 mb-10 h-px bg-border" />

          <div className="prose-fh">
            <p>
              Executive coaching runs $300 to $500 an hour. At the high end,
              $1,000. Enterprise platforms like BetterUp charge companies $3,000
              to $5,000 per employee per year. The market is projected past $30
              billion globally. Somebody is paying these numbers.
            </p>

            <p>
              The question is what they're getting for it.
            </p>

            <blockquote>
              <p>
                "Where can I find coaches under $500/month? I can't afford
                $300-500/session but I know I need help."
              </p>
              <cite className="mono tracking-[0.06em] uppercase">— Reddit</cite>
            </blockquote>

            <p>
              That's not someone who doesn't value coaching. That's someone
              priced out of a system that was never designed for them.
            </p>

            <h2>Where the Money Goes</h2>

            <p>
              A coach charging $400 an hour isn't pocketing $400. ICF
              certification costs $7,000 to $12,000 and requires 125+ hours of
              supervised coaching before you can even start. Continuing education
              runs $2,000 to $5,000 a year. If they're on a platform, the
              platform takes 20 to 40 percent. Marketing, liability insurance,
              admin, scheduling tools. The overhead is real.
            </p>

            <p>
              Then there's the delivery model itself. One coach, one client, one
              hour. That's the ceiling. A coach with 20 client hours a week is
              fully loaded. They can't see more people without burning out or
              dropping quality. So prices go up. Not because the value increased,
              but because supply is physically capped.
            </p>

            <p>
              The $300/hour price tag is less about what the expertise is worth
              and more about what synchronous one-to-one human time costs to
              deliver.
            </p>

            <h2>What the Platforms Charge For</h2>

            <p>
              Enterprise coaching platforms solved the procurement problem. HR
              can now buy coaching at scale, assign it to employees, and track
              engagement. That's valuable to the buyer. It's not always valuable
              to the person getting coached.
            </p>

            <blockquote>
              <p>
                "My company offers BetterUp, but the coach they assigned knew
                nothing about my field. I'm a senior PM and got matched with a
                generic leadership coach."
              </p>
              <cite className="mono tracking-[0.06em] uppercase">— Reddit</cite>
            </blockquote>

            <blockquote>
              <p>
                "BetterUp feels like a basic CRUD SaaS app with coaches bolted
                on."
              </p>
              <cite className="mono tracking-[0.06em] uppercase">— Vendr reviews</cite>
            </blockquote>

            <p>
              The platform optimizes for matching at scale, not matching with
              precision. When you're spending someone else's money, "good enough"
              is the bar. When you're spending your own, you need the person
              sitting across from you to have actually done the job you're trying
              to do.
            </p>

            <h2>The Missing Middle</h2>

            <p>
              There's a gap in the market that nobody serves well. Below $100 a
              session, you get peer mentoring, free platforms with inconsistent
              quality, or group coaching that's really just a webinar. Above
              $300, you get credentialed coaches who may or may not have relevant
              experience. Enterprise platforms sit at $3,000+ annually but
              optimize for HR dashboards, not outcomes.
            </p>

            <p>
              The middle, $100 to $250 for domain-specific expertise from
              someone who's actually operated in your context, barely exists as a
              category. The people who could fill it are busy doing the work.
              They're not building coaching practices or getting certified.
              They're running companies, leading teams, closing deals.
            </p>

            <blockquote>
              <p>
                "The entire field has a massive credibility problem. It's become
                the capitalist version of a spiritual guru."
              </p>
              <cite className="mono tracking-[0.06em] uppercase">— Bogleheads forum</cite>
            </blockquote>

            <p>
              That credibility gap exists because the market selected for people
              who want to coach, not people who have something worth teaching.
              The credentialing system rewards coaching hours. It doesn't measure
              whether the coach has ever done the thing they're coaching you on.
            </p>

            <h2>The Real Question</h2>

            <p>
              The $300/hour price isn't wrong. It's the natural result of a
              model where the only way to access expertise is through
              synchronous, one-to-one human time. If that's the only format
              available, the price will always be high and the access will always
              be limited.
            </p>

            <p>
              The question worth asking isn't "how do we make coaching cheaper?"
              It's "does it have to be this format at all?"
            </p>

            <p>
              The expertise is the valuable part. The specific hour on someone's
              calendar is just the delivery mechanism. When those two things are
              bundled together, you get a market where the best people are
              overbooked, the prices keep climbing, and the people who need help
              most are stuck scrolling through profiles they can't afford.
            </p>

            <div className="border-l-2 border-accent pl-6 my-8 text-[20px] italic leading-[1.4] text-foreground">
              Separate the expertise from the calendar, and the math changes
              completely.
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
