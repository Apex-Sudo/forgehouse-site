"use client";
import { useState } from "react";

const LABEL = "mono text-[11px] tracking-[0.06em] uppercase text-muted mb-2 block";
const FIELD =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-[16px] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition";

export default function ApplyPage() {
  const [form, setForm] = useState({ name: "", email: "", linkedin: "", role: "", expertise: "", whyForgeHouse: "", contentLink: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/mentor-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-20 md:pt-28 pb-24 md:pb-32">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] tracking-[0.06em] uppercase text-accent mb-5">Become a Trained Expert</p>
          <h1 className="text-[44px] md:text-[64px] leading-[0.92] tracking-[-0.015em] max-w-[880px]">
            More people need what you know than you&apos;ll ever have <span className="text-accent">time to help.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-[1.5] text-muted max-w-[520px]">
            Your agent thinks like you 24/7 and compounds with every conversation.
          </p>

          <div className="mt-14 max-w-[560px]">
            {submitted ? (
              <div className="rounded-lg border border-accent/25 bg-accent/5 p-8">
                <p className="text-[28px] leading-[1.1] text-accent mb-3">Application received.</p>
                <p className="text-[16px] leading-[1.55] text-muted">
                  We review every submission personally. If there&apos;s a fit, we&apos;ll be in touch within 5 business days.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-border bg-surface p-7 md:p-9 space-y-6"
              >
                <div>
                  <label htmlFor="apply-name" className={LABEL}>
                    Full name
                  </label>
                  <input
                    id="apply-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label htmlFor="apply-email" className={LABEL}>
                    Email
                  </label>
                  <input
                    id="apply-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label htmlFor="apply-linkedin" className={LABEL}>
                    LinkedIn profile URL
                  </label>
                  <input
                    id="apply-linkedin"
                    type="url"
                    required
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label htmlFor="apply-role" className={LABEL}>
                    Current role and company
                  </label>
                  <input
                    id="apply-role"
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label htmlFor="apply-expertise" className={LABEL}>
                    What do people come to you for?
                  </label>
                  <textarea
                    id="apply-expertise"
                    required
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                    rows={3}
                    className={`${FIELD} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="apply-why" className={LABEL}>
                    Why does this interest you?
                  </label>
                  <textarea
                    id="apply-why"
                    required
                    value={form.whyForgeHouse}
                    onChange={(e) => setForm({ ...form, whyForgeHouse: e.target.value })}
                    rows={3}
                    className={`${FIELD} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="apply-content" className={LABEL}>
                    Link to something that shows how you think (blog, talk, thread)
                  </label>
                  <input
                    id="apply-content"
                    type="url"
                    required
                    value={form.contentLink}
                    onChange={(e) => setForm({ ...form, contentLink: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mono inline-flex items-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                    <span aria-hidden="true">›</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
