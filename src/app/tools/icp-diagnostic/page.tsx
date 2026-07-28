import type { Metadata } from "next";
import ICPDiagnosticTool from "./ICPDiagnosticTool";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ICP Diagnostic — Define Your Ideal Customer in 60 Seconds | ForgeHouse",
  description: "Define your ideal customer profile using the Jobs-to-be-Done framework. Free, no login required.",
  openGraph: {
    title: "ICP Diagnostic — Define Your Ideal Customer in 60 Seconds",
    description: "Define your ideal customer profile using the Jobs-to-be-Done framework. Free, no login required.",
    url: "https://forgehouse.io/tools/icp-diagnostic",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ICP Diagnostic",
  url: "https://forgehouse.io/tools/icp-diagnostic",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Define your ideal customer profile in 60 seconds using the Jobs-to-be-Done framework. Free, no login required.",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ICPDiagnosticTool />

      {/* Server-rendered SEO content */}
      <section className="max-w-[720px] mx-auto px-6 pb-20 space-y-14">
        {/* What this tool does */}
        <div>
          <h2 className="text-[30px] leading-[1.05] text-foreground mb-4">
            What is an ICP Diagnostic?
          </h2>
          <div className="space-y-4">
            <p className="text-[16px] leading-[1.65] text-muted">
              An Ideal Customer Profile defines exactly who your product is built for. Not a broad market segment, but the specific company type, buyer role, and situation where your product creates the most value.
            </p>
            <p className="text-[16px] leading-[1.65] text-muted">
              This tool uses the Jobs-to-be-Done framework to map the functional, social, and emotional reasons your customers hire your product. Instead of demographic guesswork, you get a profile based on what your customers are actually trying to accomplish.
            </p>
            <p className="text-[16px] leading-[1.65] text-muted">
              Whether you have existing customers or are pre-revenue, the diagnostic adapts. For pre-revenue founders, it builds on your hypotheses and flags them as assumptions to validate.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-[30px] leading-[1.05] text-foreground mb-4">
            How it works
          </h2>
          <div className="space-y-4">
            <p className="text-[16px] leading-[1.65] text-muted">
              Answer five questions about your product and customers. The tool analyzes your answers using JTBD methodology and produces five outputs: an ICP profile with industry, company size, and buyer role; a JTBD map covering functional, social, and emotional jobs; disqualification criteria so you stop wasting time on bad-fit prospects; specific channels and search strings to find your ideal customers; and an opening message template.
            </p>
            <p className="text-[16px] leading-[1.65] text-muted">
              Built on Colin Chapman&apos;s 25 years of B2B sales methodology. The same frameworks he uses with clients, available instantly.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-[30px] leading-[1.05] text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-7">
            <div>
              <h3 className="text-[20px] text-foreground mb-1.5">What is an Ideal Customer Profile?</h3>
              <p className="text-[16px] leading-[1.6] text-muted">
                An ICP describes the type of company most likely to buy your product and get real value from it. It includes industry, company size, buyer role, budget signals, and the specific problems they need solved. A strong ICP saves sales teams from chasing prospects who will never close.
              </p>
            </div>
            <div>
              <h3 className="text-[20px] text-foreground mb-1.5">What is the Jobs-to-be-Done framework?</h3>
              <p className="text-[16px] leading-[1.6] text-muted">
                JTBD is a methodology that focuses on what customers are trying to accomplish rather than who they are demographically. Every purchase is a &quot;hiring&quot; decision: customers hire products to do a functional job (the task), a social job (how it makes them look), and an emotional job (how it makes them feel).
              </p>
            </div>
            <div>
              <h3 className="text-[20px] text-foreground mb-1.5">Can I use this if I haven&apos;t sold anything yet?</h3>
              <p className="text-[16px] leading-[1.6] text-muted">
                Yes. The tool adapts for pre-revenue founders. Instead of analyzing existing customers, it builds on your assumptions about who needs your product and flags the output as hypotheses to validate through customer conversations.
              </p>
            </div>
            <div>
              <h3 className="text-[20px] text-foreground mb-1.5">Is my data stored?</h3>
              <p className="text-[16px] leading-[1.6] text-muted">
                No. Your answers are processed in real time and never saved. Each diagnostic is generated fresh and exists only in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-links */}
        <div className="border-t border-border pt-8">
          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mb-4">More free tools</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/tools/cold-email-teardown" className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition">
              Cold Email Teardown →
            </Link>
            <Link href="/tools/pipeline-diagnosis" className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition">
              Pipeline Diagnosis →
            </Link>
            <Link href="/tools/outbound-planner" className="mono text-[12px] tracking-[0.02em] text-muted hover:text-accent transition">
              Outbound Week Planner →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
