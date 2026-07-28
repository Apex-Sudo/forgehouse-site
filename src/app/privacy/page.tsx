import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ForgeHouse",
  description: "How ForgeHouse collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-16 md:pt-24 pb-24">
        <div className="max-w-[720px] mx-auto">
          <p className="mono text-[13px] text-accent mb-5">Legal</p>
          <h1 className="text-[48px] md:text-[64px] leading-[0.95] tracking-[-0.015em] text-paper">
            Privacy Policy
          </h1>
          <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mt-6">
            Last updated: April 9, 2026
          </p>

          <div className="mt-10 h-px bg-border" />

          <div className="prose-fh mt-4">
            <section>
              <h2>What We Collect</h2>
              <p>
                When you sign in with LinkedIn or Google, we receive your name, email address, profile
                picture, and (from LinkedIn) your professional headline where available. We use this to
                create your ForgeHouse account and personalize your experience.
              </p>
              <p>
                When you sign in with email, we send a one-time verification code to your address via
                our email delivery provider; we do not use a password for that path.
              </p>
              <p>
                When you interact with mentor agents, we store your conversation history to provide
                continuity across sessions. Paid subscribers retain conversation history indefinitely.
                Free tier users retain history for 7 days.
              </p>
            </section>

            <section>
              <h2>How We Use Your Data</h2>
              <ul className="list-disc list-outside pl-5 space-y-2 mb-6 text-[16px] leading-[1.7] text-foreground/70">
                <li>Authenticate your identity and manage your account</li>
                <li>Store conversation history and saved insights for your use</li>
                <li>Inject conversation context into mentor agent sessions for continuity</li>
                <li>Process payments through Stripe (we do not store payment details)</li>
                <li>Send transactional emails related to your account and subscriptions</li>
              </ul>
            </section>

            <section>
              <h2>What We Do Not Do</h2>
              <ul className="list-disc list-outside pl-5 space-y-2 mb-6 text-[16px] leading-[1.7] text-foreground/70">
                <li>We do not sell your data to third parties</li>
                <li>We do not share your conversations with mentors or other users</li>
                <li>We do not use your conversations to train AI models</li>
                <li>We do not post to your LinkedIn account</li>
              </ul>
            </section>

            <section>
              <h2>Data Storage</h2>
              <p>
                Your data is stored securely on Supabase (PostgreSQL) with row-level security policies.
                Conversations are encrypted in transit. Only you can access your conversation history
                and saved insights.
              </p>
            </section>

            <section>
              <h2>Third-Party Services</h2>
              <ul className="list-disc list-outside pl-5 space-y-2 mb-6 text-[16px] leading-[1.7] text-foreground/70 [&_strong]:text-foreground">
                <li><strong>LinkedIn &amp; Google:</strong> Authentication (OAuth 2.0)</li>
                <li><strong>Resend:</strong> Transactional email (e.g. sign-in verification codes)</li>
                <li><strong>Anthropic:</strong> AI model provider for mentor agents</li>
                <li><strong>Voyage AI:</strong> Embeddings used to index and retrieve mentor knowledge</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
                <li><strong>Upstash:</strong> Low-latency data store for rate limits, short-lived verification data, and server-side API credentials</li>
                <li><strong>PostHog:</strong> Product analytics (events to improve the product)</li>
                <li><strong>Vercel:</strong> Hosting</li>
              </ul>
            </section>

            <section>
              <h2>Your Rights</h2>
              <p>
                You can request deletion of your account and all associated data at any time by
                contacting us at leon@forgehouse.io. We will process deletion requests within 30 days.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about this policy? Email leon@forgehouse.io.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
