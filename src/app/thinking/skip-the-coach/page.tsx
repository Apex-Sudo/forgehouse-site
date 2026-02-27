import Link from "next/link";

export default function SkipTheCoachPost() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-6">
      <article className="max-w-2xl mx-auto">
        <Link
          href="/thinking"
          className="text-sm text-muted/60 hover:text-muted transition mb-8 block"
        >
          ← Thinking
        </Link>

        <time className="text-sm text-muted/60">February 2026</time>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-8 leading-tight">
          Skip the Coach. Find a Mentor Who's Done Your Job.
        </h1>

        <div className="prose-fh">
          <p className="text-lg text-muted mb-8">
            The coaching industry has professionalized advice-giving. That's the
            problem.
          </p>

          <p>
            There are more coaches available today than at any point in history.
            Executive coaches, leadership coaches, career coaches, startup
            coaches, transition coaches. Certifications from ICF, CCE, EMCC.
            Programs that cost $10,000 to complete and qualify you to charge $300
            an hour.
          </p>

          <p>
            And yet, when you ask people who actually got unstuck, the answer is
            almost never "I hired a coach."
          </p>

          <blockquote>
            <p>
              "A few hours of conversation with someone in my exact field was
              more valuable than months of online research."
            </p>
            <cite>— r/Entrepreneur</cite>
          </blockquote>

          <p>
            That's not an indictment of coaching. It's a signal about what
            actually works. The person who helped wasn't certified in anything.
            They'd just already solved the problem you're facing.
          </p>

          <h2>The Credential Trap</h2>

          <p>
            Coaching certifications teach you how to coach. They don't teach you
            how to run a 50-person engineering team, or close enterprise deals,
            or navigate a Series A when your runway is five months.
          </p>

          <p>
            The result is a market full of people who are trained to ask good
            questions but have never lived the answers. That's useful for some
            things. Self-awareness. Communication patterns. Accountability. But
            when you're staring at a specific decision with real consequences,
            you don't need someone to ask you how you feel about it. You need
            someone who's made that call before and knows what happens next.
          </p>

          <blockquote>
            <p>
              "None of these gurus are in your shoes so they cannot help you. Tai
              Lopez or Gary Vee cannot help me build the AI for my game."
            </p>
            <cite>— r/Entrepreneur</cite>
          </blockquote>

          <blockquote>
            <p>
              "The entire field has a massive credibility problem."
            </p>
            <cite>— Bogleheads forum, on executive coaching</cite>
          </blockquote>

          <p>
            The credibility problem isn't that coaches are bad people. It's that
            the structure rewards credentials over experience. A coach with 500
            hours of supervised coaching and an ICF badge outranks a founder
            who's scaled three companies and exited two, simply because one has a
            certificate and the other doesn't.
          </p>

          <p className="text-foreground font-semibold text-lg my-8">
            The market optimizes for trained coaches. People optimize for someone
            who's done the job.
          </p>

          <h2>Specificity Is the Whole Game</h2>

          <p>
            The most consistent pattern across every forum, every thread, every
            frustrated post about mentoring: people don't want advice. They want
            relevant advice. From someone who's operated in their exact context.
          </p>

          <p>
            A first-time founder doesn't need a business coach. They need
            someone who's built a SaaS company from zero to first revenue in the
            last five years. A new engineering director doesn't need leadership
            coaching. They need someone who managed a team their size, at a
            similar stage company, and figured out the transition from execution
            to management.
          </p>

          <blockquote>
            <p>
              "I'm on my sixth try to find a worthwhile coach or mentor. The
              skills that got me promoted are not the skills I need now."
            </p>
            <cite>— Reddit</cite>
          </blockquote>

          <p>
            Six tries. That's not a picky person. That's a broken discovery
            system. The platforms serve you coaches by availability and
            certification. Not by "has done exactly what you're trying to do."
          </p>

          <h2>What Actually Helps</h2>

          <p>
            The pattern is simple. The people who report real breakthroughs found
            someone with direct operational experience in their specific domain.
            Not a generalist. Not a guru. Someone 3 to 10 years ahead of them on
            the same path.
          </p>

          <p>
            The problem is finding that person. Cold DMs don't work. LinkedIn is
            noise. The best mentors are already overbooked with people who found
            them through word of mouth. And the platforms that could solve this
            are still sorting by certification tier and hourly rate, not by "has
            actually done the thing."
          </p>

          <blockquote>
            <p>
              "I've been looking for a mentor for a while, I tried everything.
              Cold messages, offering value upfront, personalized videos. In the
              end no one really cared."
            </p>
            <cite>— r/startups</cite>
          </blockquote>

          <p>
            The coaching industry built infrastructure around delivery.
            Scheduling, video calls, session notes, progress tracking. All
            polished. But the core matching problem, connecting the right person
            with the right experience to the right situation, remains unsolved.
          </p>

          <p>
            Credentials tell you someone learned to coach. Track record tells you
            someone learned by doing. When you're making a decision that matters,
            the difference between those two things is everything.
          </p>
        </div>
      </article>
    </main>
  );
}
