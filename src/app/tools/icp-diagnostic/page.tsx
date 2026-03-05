import ICPDiagnosticTool from "./ICPDiagnosticTool";
import Link from "next/link";

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
      <section className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        {/* What this tool does */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What is an ICP Diagnostic?
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              An Ideal Customer Profile defines exactly who your product is built for. Not a broad market segment, but the specific company type, buyer role, and situation where your product creates the most value.
            </p>
            <p>
              This tool uses the Jobs-to-be-Done framework to map the functional, social, and emotional reasons your customers hire your product. Instead of demographic guesswork, you get a profile based on what your customers are actually trying to accomplish.
            </p>
            <p>
              Whether you have existing customers or are pre-revenue, the diagnostic adapts. For pre-revenue founders, it builds on your hypotheses and flags them as assumptions to validate.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            How it works
          </h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Answer five questions about your product and customers. The tool analyzes your answers using JTBD methodology and produces five outputs: an ICP profile with industry, company size, and buyer role; a JTBD map covering functional, social, and emotional jobs; disqualification criteria so you stop wasting time on bad-fit prospects; specific channels and search strings to find your ideal customers; and an opening message template.
            </p>
            <p>
              Built on Colin Chapman&apos;s 25 years of B2B sales methodology. The same frameworks he uses with clients, available instantly.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What is an Ideal Customer Profile?</h3>
              <p className="text-muted text-sm leading-relaxed">
                An ICP describes the type of company most likely to buy your product and get real value from it. It includes industry, company size, buyer role, budget signals, and the specific problems they need solved. A strong ICP saves sales teams from chasing prospects who will never close.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">What is the Jobs-to-be-Done framework?</h3>
              <p className="text-muted text-sm leading-relaxed">
                JTBD is a methodology that focuses on what customers are trying to accomplish rather than who they are demographically. Every purchase is a &quot;hiring&quot; decision: customers hire products to do a functional job (the task), a social job (how it makes them look), and an emotional job (how it makes them feel).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Can I use this if I haven&apos;t sold anything yet?</h3>
              <p className="text-muted text-sm leading-relaxed">
                Yes. The tool adapts for pre-revenue founders. Instead of analyzing existing customers, it builds on your assumptions about who needs your product and flags the output as hypotheses to validate through customer conversations.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Is my data stored?</h3>
              <p className="text-muted text-sm leading-relaxed">
                No. Your answers are processed in real time and never saved. Each diagnostic is generated fresh and exists only in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-links */}
        <div className="border-t border-border-light pt-8">
          <p className="text-xs text-muted/50 uppercase tracking-wider mb-4">More free tools</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/cold-email-teardown" className="text-sm text-muted hover:text-amber transition">
              Cold Email Teardown →
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
