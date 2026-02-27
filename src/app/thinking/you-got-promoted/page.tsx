import Link from "next/link";

export default function YouGotPromotedPost() {
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
          You Got Promoted. No One Trained You. Now What?
        </h1>

        <div className="prose-fh">
          <p className="text-lg text-muted mb-8">
            The skills that got you promoted are not the skills you need now.
            Nobody mentioned that during the congratulations.
          </p>

          <p>
            You were the best engineer on the team. Or the highest-performing
            sales rep. Or the PM who shipped every quarter. Then someone
            tapped you on the shoulder and said "we'd like you to lead the
            team."
          </p>

          <p>
            That was the last useful thing anyone told you.
          </p>

          <p>
            Now you're managing people who do the job you used to do. Your
            calendar is full of one-on-ones you were never taught how to run.
            You're making hiring decisions based on instinct because nobody
            gave you a framework. Someone on your team is underperforming and
            you're not sure if it's a coaching problem, a fit problem, or a
            you problem.
          </p>

          <blockquote>
            <p>
              "The skills that got me promoted are not the skills I need now.
              I'm on my sixth try to find a worthwhile coach or mentor."
            </p>
            <cite>— Reddit</cite>
          </blockquote>

          <p>
            Sixth try. That's someone who knows they need help and can't find
            the right kind.
          </p>

          <h2>The Gap Nobody Prepares You For</h2>

          <p>
            The transition from execution to leadership is the single most
            common career inflection point. Millions of people go through it
            every year. Almost none of them are trained for it before it
            happens.
          </p>

          <p>
            Companies invest in hiring. They invest in onboarding. They invest
            in tools and systems and quarterly offsites. Then they promote
            their best individual contributor into a management role and hope
            for the best. The implicit assumption is that being great at the
            work means you'll be great at leading people who do the work.
          </p>

          <p>
            That assumption is wrong roughly half the time.
          </p>

          <p>
            The skills are fundamentally different. Execution rewards depth,
            focus, and individual output. Management rewards delegation,
            context-switching, and making other people better. The person who
            thrived by going deep now needs to stay wide. The person who loved
            solving problems now needs to let other people solve them.
          </p>

          <h2>Why Generic Coaching Doesn't Work Here</h2>

          <p>
            This is where the "leadership coach" industry falls short.
            Generic leadership coaching gives you communication frameworks,
            conflict resolution templates, and feedback models. All useful in
            theory. All disconnected from the specific reality of managing a
            team of six engineers at a Series B startup, or leading a
            regional sales team that just lost its top performer, or running
            product for a company that's pivoting mid-quarter.
          </p>

          <blockquote>
            <p>
              "My company offers BetterUp but the coach knew nothing about my
              field. Generic advice about 'setting boundaries' when I need
              someone who understands sprint planning and tech debt."
            </p>
            <cite>— Reddit</cite>
          </blockquote>

          <p>
            The context is the whole point. A new engineering manager doesn't
            need abstract leadership principles. They need someone who managed
            an engineering team their size, at a similar stage company, three
            to five years ago. Someone who's already made the mistakes they're
            about to make and can name them before they happen.
          </p>

          <p>
            That person exists. There are thousands of them. They're running
            teams right now, or they moved on to director-level roles, or
            they started companies. They have exactly the pattern recognition
            a new manager needs.
          </p>

          <p>
            They're just not on any coaching platform. They don't have
            certifications. They don't have "leadership coach" in their
            LinkedIn title. They have the experience. They just never
            productized it.
          </p>

          <h2>What Would Actually Help</h2>

          <p>
            The new manager doesn't need a 12-week program. They need three
            things.
          </p>

          <p>
            First, someone who's been in their specific seat. Not a general
            manager. Not a career coach. Someone who's managed the same
            function, at a similar scale, recently enough that the advice is
            still current.
          </p>

          <p>
            Second, access when the problem is live. Not in two weeks at the
            next scheduled session. When they're drafting the PIP, or
            deciding whether to promote someone, or figuring out how to tell
            their VP that the timeline is unrealistic.
          </p>

          <p>
            Third, honesty without politics. Their manager has an agenda.
            Their peers are competing for the same promotion. HR is tracking
            the conversation. They need someone outside the system who can
            say "you're handling this wrong" without it showing up in a
            performance review.
          </p>

          <blockquote>
            <p>
              "I talk to people every day, from customers to contractors, but
              it's not the same. None of them can tell me if I'm making the
              right call."
            </p>
            <cite>— r/startups</cite>
          </blockquote>

          <p className="text-foreground font-semibold text-lg my-8">
            The promotion was the easy part. What comes after is where people
            either grow into the role or quietly start looking for their old
            job back.
          </p>

          <p>
            The gap between getting promoted and being ready for the role is
            where careers are made or stalled. Right now, most people navigate
            it alone. Not because they want to, but because the help they
            need doesn't fit into any existing category. Too specific for a
            generic coach. Too junior for an executive program. Too urgent for
            a scheduled session.
          </p>

          <p>
            That gap has a name. It just doesn't have a solution yet.
          </p>
        </div>
      </article>
    </main>
  );
}
