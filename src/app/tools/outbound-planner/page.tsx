import OutboundPlannerTool from "./OutboundPlannerTool";
import Link from "next/link";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Outbound Week Planner",
  url: "https://forgehouse.io/tools/outbound-planner",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Get a concrete Mon-Fri outbound action plan with daily tasks, email templates, and targets. Free sales planning tool.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <OutboundPlannerTool />

      <section className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Why outbound needs a weekly plan
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Most founders approach outbound reactively. They send a burst of emails when pipeline feels empty, then stop when they get busy with delivery. This creates feast-or-famine cycles that never produce consistent pipeline.
            </p>
            <p>
              A weekly outbound plan solves this by breaking the work into daily tasks calibrated to your current pipeline state. Empty pipeline means more new outreach. Full pipeline means more follow-ups and closing. The plan adapts to where you actually are, not a generic template.
            </p>
            <p>
              Tell the tool what you sell, who you sell to, and where your pipeline stands today. It produces a concrete Monday-through-Friday action plan with specific tasks, ready-to-use email templates, and daily targets you can track.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What you get
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Five day-by-day action plans with 2-4 specific tasks each. Monday focuses on research and list building. Tuesday through Thursday is heavy outreach and follow-up. Friday is review and planning for next week. Every task is specific enough to execute without thinking.
            </p>
            <p>
              You also get three email templates: a cold outreach message, a follow-up for day 3-4, and a breakup email for end of week. Each uses placeholder fields so you can personalize with your own proof points and case studies.
            </p>
            <p>
              Daily and weekly targets keep you accountable. Calibrated for one person, not a sales team.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">How many outreach messages should I send per day?</h3>
              <p className="text-muted text-sm leading-relaxed">
                For a solo founder, 15-25 new outreach messages per day is sustainable. The planner calibrates this based on your pipeline state. If you have active deals that need follow-up, new outreach volume drops to make room.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What if I&apos;m starting from zero pipeline?</h3>
              <p className="text-muted text-sm leading-relaxed">
                The planner adapts. With an empty pipeline, the plan emphasizes research, list building, and high-volume initial outreach. You need conversations before you need follow-up sequences.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Should I use email or LinkedIn for outreach?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Both. The planner includes LinkedIn engagement as part of the daily targets. The most effective outbound combines email sequences with LinkedIn touchpoints. The channel depends on where your buyers spend their time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Is my data stored?</h3>
              <p className="text-muted text-sm leading-relaxed">
                No. Your inputs are processed in real time and never saved. The plan exists only in your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-light pt-8">
          <p className="text-xs text-muted/50 uppercase tracking-wider mb-4">More free tools</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/icp-diagnostic" className="text-sm text-muted hover:text-amber transition">
              ICP Diagnostic →
            </Link>
            <Link href="/tools/cold-email-teardown" className="text-sm text-muted hover:text-amber transition">
              Cold Email Teardown →
            </Link>
            <Link href="/tools/pipeline-diagnosis" className="text-sm text-muted hover:text-amber transition">
              Pipeline Diagnosis →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
