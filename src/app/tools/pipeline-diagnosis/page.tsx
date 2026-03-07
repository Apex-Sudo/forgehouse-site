import type { Metadata } from "next";
import PipelineDiagnosisTool from "./PipelineDiagnosisTool";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pipeline Diagnosis — Find the Pattern Killing Your Deals | ForgeHouse",
  description: "Describe your last 3 lost deals and find the pattern killing your pipeline. Free sales diagnostic tool.",
  openGraph: {
    title: "Pipeline Diagnosis — Find the Pattern Killing Your Deals",
    description: "Describe your last 3 lost deals and find the pattern killing your pipeline. Free sales diagnostic tool.",
    url: "https://forgehouse.io/tools/pipeline-diagnosis",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pipeline Diagnosis",
  url: "https://forgehouse.io/tools/pipeline-diagnosis",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Describe your last 3 lost deals and find the pattern killing your pipeline. Free sales diagnostic tool.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PipelineDiagnosisTool />

      <section className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Why deals really stall
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Most founders think each lost deal has its own reason. The prospect went dark, they chose a competitor, timing was wrong. But when you line up three or more losses side by side, a pattern almost always emerges. The same failure point shows up across deals that look completely different on the surface.
            </p>
            <p>
              This tool performs a deal autopsy on your last three losses, identifies where each one actually died in your pipeline, and surfaces the root cause behind the excuse. Then it finds the pattern connecting them and prescribes the single highest-leverage fix.
            </p>
            <p>
              One fix, not ten. The change that would save the most revenue if you implemented it this week.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What you get
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              The diagnosis produces five outputs: individual deal autopsies showing where and why each deal died; the connecting pattern across all three; the one fix with a 7-day implementation plan; a salvage assessment for each deal (can it be revived or is it dead); and a pipeline health score with risks and strengths.
            </p>
            <p>
              Built on Colin Chapman&apos;s deal analysis methodology from 25 years of B2B sales. The same diagnostic process he runs with clients, distilled into a tool you can use in three minutes.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Why three deals?</h3>
              <p className="text-muted text-sm leading-relaxed">
                One lost deal is an anecdote. Two might be coincidence. Three reveals a pattern. The diagnostic needs enough data to separate the systemic issue from individual deal noise.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What if my deals died for completely different reasons?</h3>
              <p className="text-muted text-sm leading-relaxed">
                That&apos;s rare, but possible. If no pattern connects them, the tool tells you and analyzes each deal independently. Even without a shared pattern, the individual root cause analysis is valuable.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What counts as a &quot;lost deal&quot;?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Any deal that entered your pipeline and didn&apos;t close. Prospects who went silent, chose a competitor, said the timing was wrong, or ghosted after a demo. The more detail you provide about what happened, the sharper the diagnosis.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Is my data stored?</h3>
              <p className="text-muted text-sm leading-relaxed">
                No. Your deal descriptions are processed in real time and never saved. The diagnosis exists only in your browser.
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
            <Link href="/tools/outbound-planner" className="text-sm text-muted hover:text-amber transition">
              Outbound Week Planner →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
