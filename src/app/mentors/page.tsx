"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PlugsConnected, ChatCircleDots } from "@phosphor-icons/react";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
};

export default function ModulesPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await fetch("/api/mentors");
        if (res.ok) {
          const data = await res.json();
          const list = data?.mentors;
          if (Array.isArray(list)) {
            setMentors(list);
          }
        }
      } catch {
        // silent
      }
      setLoadingMentors(false);
    };
    loadMentors();
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
          Expert knowledge, <span className="text-amber">packaged.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Each module is built from one expert&apos;s real experience. Plug it into your agent or use it directly.
        </p>
      </section>

      {/* Active mentors grid */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingMentors && (
              <div className="glass-card p-8 md:p-10 animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-foreground/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 bg-foreground/5 rounded" />
                    <div className="h-3 w-40 bg-foreground/5 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-foreground/5 rounded" />
                <div className="h-3 w-3/4 bg-foreground/5 rounded" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-9 bg-foreground/5 rounded" />
                  <div className="h-9 bg-foreground/5 rounded" />
                </div>
              </div>
            )}

            {!loadingMentors && mentors.length === 0 && (
              <div className="glass-card p-8 md:p-10 text-center">
                <p className="text-lg font-semibold mb-2">No mentors available yet</p>
                <p className="text-muted text-sm mb-4">We&apos;re onboarding new experts. Join the waitlist to be notified.</p>
                <Link href="/pricing" className="text-amber font-semibold hover:opacity-80">See plans</Link>
              </div>
            )}

            {mentors.map((m) => (
              <div key={m.slug} className="glass-card p-8 md:p-10 flex flex-col gap-5">
                <div className="flex items-start gap-5">
                  <Image
                    src={m.avatar_url || "/mentors/default-avatar.svg"}
                    alt={m.name}
                    width={64}
                    height={64}
                    className="rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <p className="text-xs text-amber font-semibold uppercase tracking-wider mb-1">Expert Module</p>
                    <h2 className="text-2xl font-bold mb-1">{m.name}</h2>
                    <p className="text-muted text-sm">{m.tagline}</p>
                  </div>
                </div>

                {m.bio != null && m.bio.trim() !== "" && (
                  <p className="text-foreground/80 text-[15px] leading-relaxed">
                    {m.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/chat/${m.slug}`}
                    className="flex items-center justify-center gap-2 bg-amber text-background py-3.5 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
                  >
                    <ChatCircleDots size={18} weight="bold" />
                    Chat with {m.name.split(" ")[0]}
                  </Link>
                  <Link
                    href={`/mentors/${m.slug}`}
                    className="flex items-center justify-center gap-2 border border-foreground/[0.1] text-muted py-3.5 rounded-xl font-medium hover:text-foreground hover:border-foreground/[0.2] transition cursor-pointer"
                  >
                    Learn more
                  </Link>
                </div>

                <p className="text-xs text-muted text-center">5 free messages. No card required.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Coming Soon */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-amber font-semibold uppercase tracking-widest mb-4">In the forge</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">More modules are being forged.</h2>
          <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
            Each one goes through weeks of extraction before it goes live. We don&apos;t rush this.
          </p>

          {/* Upcoming modules */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-md mx-auto">
            {[
              { label: "Brand & Reputation", desc: "Positioning, narrative, PR" },
              { label: "Revenue Operations", desc: "Systems, metrics, forecasting" },
              { label: "Product Strategy", desc: "Roadmap, prioritization, PMF" },
            ].map((mod) => (
              <div key={mod.label} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] mx-auto mb-2 flex items-center justify-center">
                  <span className="text-foreground/20 text-lg">?</span>
                </div>
                <p className="text-[11px] text-muted/70 font-medium">{mod.label}</p>
                <p className="text-[10px] text-muted/40 mt-0.5">{mod.desc}</p>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          {submitted ? (
            <div className="glass-card p-6 max-w-md mx-auto">
              <p className="text-amber font-medium">You&apos;re on the list.</p>
              <p className="text-muted text-sm mt-1">We&apos;ll notify you when the next module goes live.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white border border-foreground/[0.12] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/40 transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber text-background px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? "..." : "Notify me"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[600px] mx-auto h-px bg-gradient-to-r from-transparent via-amber/[0.12] to-transparent" />

      {/* Expert recruitment CTA */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted mb-3">Have expertise worth preserving?</p>
          <Link href="/apply" className="text-amber hover:underline font-medium">
            Apply to become an expert →
          </Link>
        </div>
      </section>
    </div>
  );
}
