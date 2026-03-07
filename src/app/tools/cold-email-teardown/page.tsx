import type { Metadata } from "next";
import ColdEmailTeardownTool from "./ColdEmailTeardownTool";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cold Email Teardown — Get Your Email Rewritten Line by Line | ForgeHouse",
  description: "Paste your cold email and get a line-by-line diagnosis plus a rewrite using the Problem-Impact-Proof framework. Free.",
  openGraph: {
    title: "Cold Email Teardown — Get Your Email Rewritten Line by Line",
    description: "Paste your cold email and get a line-by-line diagnosis plus a rewrite using the Problem-Impact-Proof framework. Free.",
    url: "https://forgehouse.io/tools/cold-email-teardown",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cold Email Teardown",
  url: "https://forgehouse.io/tools/cold-email-teardown",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Paste your cold email and get a line-by-line diagnosis plus a rewrite using the Problem-Impact-Proof framework.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ColdEmailTeardownTool />

      <section className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Why most cold emails fail
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              The average cold email gets a 1-3% reply rate. The reason is almost always the same: the email talks about the sender instead of the recipient&apos;s problem. Buyers delete emails that start with &quot;I&quot; or &quot;We&quot; before reaching the second sentence.
            </p>
            <p>
              This tool diagnoses your cold email line by line, identifies exactly where readers stop caring, and rewrites it using the Problem-Impact-Proof framework. Lead with their problem, show the business impact of not solving it, then prove you can help.
            </p>
            <p>
              Built on Colin Chapman&apos;s 25 years of B2B outbound sales methodology. The same structure he uses to help clients consistently book meetings from cold outreach.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            The Problem-Impact-Proof framework
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Every effective cold email follows three beats. First, name the specific problem the recipient faces. Not a generic industry challenge, but something they recognize from their daily work. Second, show the impact: what this problem costs them in revenue, time, or competitive position. Third, prove you can solve it with a specific result you delivered for someone like them.
            </p>
            <p>
              Most cold emails skip the problem entirely and jump straight to a product pitch. The teardown catches this and restructures your message so the recipient sees their own situation reflected back before you ask for anything.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">How long should a cold email be?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Under 100 words for the body. Every word beyond that reduces your reply rate. The teardown rewrites your email to stay within this range while keeping the core message intact.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What makes a good cold email subject line?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Subject lines that reference the recipient&apos;s specific situation outperform generic ones. Mention their company, a recent event, or the exact problem you solve. Avoid clickbait, all caps, or anything that looks like marketing.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Can I paste a LinkedIn message instead?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Yes. The diagnostic works on any outbound message. LinkedIn DMs, cold emails, and InMail all follow the same structural principles. Paste whatever you want feedback on.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Is my email stored?</h3>
              <p className="text-muted text-sm leading-relaxed">
                No. Your email is processed in real time and never saved. The analysis exists only in your browser session.
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
            <Link href="/tools/pipeline-diagnosis" className="text-sm text-muted hover:text-amber transition">
              Pipeline Diagnosis →
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
