import Link from "next/link";

const phases = [
  {
    num: "01",
    title: "Selection",
    duration: "1 week",
    desc: "Not everyone gets in. We look for people who've made real decisions under real pressure. Credentials don't matter. Track record does.",
    detail: "If they haven't done the thing, they don't get in.",
  },
  {
    num: "02",
    title: "Extraction",
    duration: "2-4 weeks",
    desc: "Hours of structured conversation designed to surface how a mentor actually thinks. Not what they'd say on a podcast. How they decide when the stakes are real.",
    detail: "We push on edge cases, ask for failures, and probe every 'it depends' until we find the branching logic underneath.",
  },
  {
    num: "03",
    title: "Assembly",
    duration: "1-2 weeks",
    desc: "Raw extraction becomes a reasoning engine. Decision patterns, heuristics, blind spot detection, domain-specific judgment. All wired together.",
    detail: "Not a bio turned into a prompt. A structured model of how someone actually decides.",
  },
  {
    num: "04",
    title: "Calibration",
    duration: "1 week",
    desc: "The mentor tests their own agent. Throws real scenarios at it. Tells us where it's wrong. We adjust until it passes their standard, not ours.",
    detail: "Their name is on it. They decide when it's ready.",
  },
  {
    num: "05",
    title: "Live",
    duration: "Ongoing",
    desc: "The agent goes live and starts compounding. Every conversation makes it sharper. The mentor reviews, refines, and the agent grows with their thinking.",
    detail: "A course is static the day it ships. A forged agent gets sharper every month.",
  },
];

export default function TheForgePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-28 md:py-36 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          The Forge
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          How we turn a mentor&apos;s real thinking into an agent worth paying for.
          Not a weekend project. Not a prompt wrapper. A multi-week process
          designed to capture what makes someone&apos;s judgment valuable.
        </p>
      </section>

      {/* Why it takes time */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto section-module gradient-blue text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why this can&apos;t be rushed</h2>
          <p className="text-muted text-[15px] leading-relaxed max-w-2xl mx-auto">
            Anyone can paste a bio into ChatGPT. The difference between that and a ForgeHouse agent
            is 20 hours of structured extraction.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-16 text-center">Five phases. No shortcuts.</h2>
          <div className="space-y-8">
            {phases.map((phase) => (
              <div key={phase.num} className="glass-card p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <span className="text-amber font-mono text-sm">{phase.num}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4 mb-3">
                      <h3 className="text-xl font-bold">{phase.title}</h3>
                      <span className="text-xs text-muted border border-glass-border px-2.5 py-1 rounded-full">{phase.duration}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed mb-3">{phase.desc}</p>
                    <p className="text-muted text-[14px] leading-relaxed">{phase.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The result */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The result</h2>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            An agent that doesn&apos;t just know what a mentor would say.
            It knows how they&apos;d think through your specific situation.
          </p>
        </div>
      </section>

      {/* For mentors CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Think your thinking is worth capturing?</h2>
          <p className="text-muted text-lg mb-8">We&apos;re selective. But if you&apos;ve built something real, we want to talk.</p>
          <Link href="/#for-mentors" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Apply as a Mentor
          </Link>
        </div>
      </section>
    </div>
  );
}
