"use client";
import { useState } from "react";

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
    <div className="pt-16">
      <section className="px-6 py-28 md:py-36 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
          More people need what you know than you&apos;ll ever have time to help.
        </h1>
        <p className="text-muted text-lg mb-12 leading-relaxed text-center">
          Your agent thinks like you 24/7 and compounds with every conversation.
        </p>

        {submitted ? (
          <div className="border border-amber/20 bg-amber/5 p-8 text-center rounded-xl max-w-lg mx-auto">
            <p className="text-lg font-semibold mb-2">Application received.</p>
            <p className="text-muted">We review every submission personally. If there&apos;s a fit, we&apos;ll be in touch within 5 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <input
              type="url"
              placeholder="LinkedIn profile URL"
              required
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <input
              type="text"
              placeholder="Current role and company"
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <textarea
              placeholder="What do people come to you for?"
              required
              value={form.expertise}
              onChange={(e) => setForm({ ...form, expertise: e.target.value })}
              rows={3}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition resize-none"
            />
            <textarea
              placeholder="Why does this interest you?"
              required
              value={form.whyForgeHouse}
              onChange={(e) => setForm({ ...form, whyForgeHouse: e.target.value })}
              rows={3}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <input
              type="url"
              placeholder="Link to something that shows how you think (blog, talk, thread)"
              required
              value={form.contentLink}
              onChange={(e) => setForm({ ...form, contentLink: e.target.value })}
              className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/30 transition"
            />
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
