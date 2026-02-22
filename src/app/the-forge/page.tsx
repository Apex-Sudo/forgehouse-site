import Link from "next/link";

const phases = [
  {
    num: "01",
    title: "Selection",
    duration: "1 week",
    desc: "Track record over credentials. If they haven't done it, they're not here.",
    detail: "",
  },
  {
    num: "02",
    title: "Contribution",
    duration: "2-4 weeks",
    desc: "How they decide when stakes are real. Not podcast talk. We push on edge cases and probe every 'it depends' until we find the logic underneath.",
    detail: "",
  },
  {
    num: "03",
    title: "Assembly",
    duration: "1-2 weeks",
    desc: "Decision patterns, heuristics, blind spots. All wired together. Not a bio turned into a prompt.",
    detail: "",
  },
  {
    num: "04",
    title: "Calibration",
    duration: "1 week",
    desc: "The mentor tests their agent with real scenarios. We adjust until it passes their standard. They decide when it's ready.",
    detail: "",
  },
  {
    num: "05",
    title: "Live",
    duration: "Ongoing",
    desc: "The agent goes live and compounds. Every conversation makes it sharper. Courses are static. Agents grow.",
    detail: "",
  },
];

export default function TheForgePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="gradient-hero px-6 py-28 md:py-36 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          The <span className="text-amber">Forge</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          How we turn a mentor&apos;s thinking into an agent. Multi-week process. Not a prompt wrapper.
        </p>
      </section>

      {/* Why it takes time */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto section-module gradient-blue text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why this can&apos;t be rushed</h2>
          <p className="text-muted text-[15px] leading-relaxed max-w-2xl mx-auto">
            20 hours of conversation and refinement. Every mentor approves their own agent. Their reputation is on the line.
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
            An agent that thinks through your specific situation.
          </p>
        </div>
      </section>

      {/* For mentors CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built something real? Let&apos;s talk.</h2>
          <p className="text-muted text-lg mb-8"></p>
          <Link href="/apply" className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-block">
            Apply as a Mentor
          </Link>
        </div>
      </section>
    </div>
  );
}
