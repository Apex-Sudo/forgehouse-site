"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ClipButton from "@/components/ui/ClipButton";
import { getExpertProfile, firstName } from "@/lib/expert-profile";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
  price?: { monthlyPrice: number };
};

type MentorPrice = {
  monthlyPrice: number;
};

export default function ModulesPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [mentorSubscribed, setMentorSubscribed] = useState<Record<string, boolean>>({});
  const [mentorPrices, setMentorPrices] = useState<Record<string, MentorPrice>>({});
  const [mentorsLoading, setMentorsLoading] = useState<Record<string, boolean>>({});

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
            // Check subscription status and prices for each mentor
            list.forEach(async (mentor: Mentor) => {
              setMentorsLoading(prev => ({ ...prev, [mentor.slug]: true }));
              // Check subscription
              try {
                const subRes = await fetch(`/api/subscription-status?mentor=${mentor.slug}`);
                if (subRes.ok) {
                  const subData = await subRes.json();
                  setMentorSubscribed(prev => ({ ...prev, [mentor.slug]: subData.isSubscribed }));
                }
              } catch {}
              // Fetch price
              try {
                const priceRes = await fetch(`/api/mentors/${mentor.slug}/pricing`);
                if (priceRes.ok) {
                  const priceData = await priceRes.json();
                  setMentorPrices(prev => ({ ...prev, [mentor.slug]: { monthlyPrice: priceData.monthlyPrice } }));
                }
              } catch {}
              setMentorsLoading(prev => ({ ...prev, [mentor.slug]: false }));
            });
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
    <div className="pt-16 md:pt-[72px]">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="px-6 pt-16 md:pt-24 pb-14">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">Expert modules</p>
          <h1 className="text-[56px] md:text-[88px] leading-[0.91] tracking-[-0.02em] max-w-[900px]">
            Expert knowledge, <span className="text-accent">packaged.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-[1.5] text-muted max-w-[560px]">
            Each module is built from one expert&apos;s real experience. Plug it into your agent or use
            it directly.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACTIVE MODULES
          ═══════════════════════════════════════════ */}
      <section className="px-6 pb-20 md:pb-24">
        <div className="max-w-[1008px] mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-[30px]">
            {loadingMentors &&
              [0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] w-full bg-surface" />
                  <div className="h-7 w-2/3 bg-surface mt-5 rounded" />
                  <div className="h-4 w-1/2 bg-surface mt-3 rounded" />
                  <div className="h-24 w-full bg-surface mt-4 rounded" />
                </div>
              ))}

            {!loadingMentors && mentors.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p className="text-[24px] text-paper mb-2">No mentors available yet</p>
                <p className="mono text-[12px] text-muted mb-5">
                  We&apos;re onboarding new experts. Join the waitlist to be notified.
                </p>
                <Link
                  href="/pricing"
                  className="mono text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
                >
                  See plans
                </Link>
              </div>
            )}

            {mentors.map((m) => {
              const profile = getExpertProfile(m.slug, m.tagline);
              const isSubscribed = mentorSubscribed[m.slug];
              const monthly = Math.floor((mentorPrices[m.slug]?.monthlyPrice || 0) / 100);
              return (
                <article key={m.slug} className="flex flex-col">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                    <Image
                      src={m.avatar_url || "/mentors/default-avatar.svg"}
                      alt={m.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 316px"
                      className="object-cover object-top"
                    />
                  </div>

                  <h2 className="mt-5 text-[28px] uppercase leading-none tracking-[0.01em] text-paper">
                    {m.name}
                  </h2>
                  <p className="text-[19px] italic text-accent mt-1">{profile.specialty}</p>

                  {profile.highlights.length > 0 && (
                    <ul className="mt-4 space-y-0.5">
                      {profile.highlights.map((h) => (
                        <li key={h} className="mono text-[11px] tracking-[0.04em] text-muted">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {m.bio != null && m.bio.trim() !== "" && (
                    <p className="mt-4 text-[16px] leading-[1.45] text-muted">{m.bio}</p>
                  )}

                  <p className="mono text-[15px] tracking-[0.02em] text-accent mt-6 mb-5">
                    {isSubscribed ? "SUBSCRIBED" : monthly > 0 ? `${monthly} USD PER MONTH` : "FREE TO START"}
                  </p>

                  <div className="mt-auto flex flex-col gap-2.5">
                    <ClipButton href={`/chat/${m.slug}`} variant="paper">
                      Chat with {firstName(m.name)}
                    </ClipButton>

                    {isSubscribed ? (
                      <div className="clip-corner mono flex items-center justify-between gap-3 w-full px-5 py-3.5 text-[12px] tracking-[0.02em] bg-surface text-faint">
                        <span>Subscribed</span>
                      </div>
                    ) : (
                      <ClipButton
                        variant="dark"
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/checkout", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ mentorSlug: m.slug }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              window.location.href = data.url;
                            }
                          } catch {
                            window.location.href = "/pricing";
                          }
                        }}
                      >
                        Pay ${monthly}/mo
                      </ClipButton>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <Link
                        href={`/mentors/${m.slug}`}
                        className="mono text-[11px] tracking-[0.04em] text-muted hover:text-accent transition"
                      >
                        Learn more
                      </Link>
                      <span className="mono text-[11px] tracking-[0.04em] text-faint">
                        5 free messages
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          IN THE FORGE
          ═══════════════════════════════════════════ */}
      <section className="sparkle-field px-6 py-20 md:py-28">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">In the forge</p>
          <h2 className="text-[44px] md:text-[64px] leading-[0.92] tracking-[-0.015em] max-w-[720px]">
            More modules are being forged.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px]">
            Each one goes through weeks of extraction before it goes live. We don&apos;t rush this.
          </p>

          {/* Upcoming modules */}
          <div className="mt-12 grid sm:grid-cols-3 gap-[30px]">
            {[
              { label: "Brand & Reputation", desc: "Positioning, narrative, PR" },
              { label: "Revenue Operations", desc: "Systems, metrics, forecasting" },
              { label: "Product Strategy", desc: "Roadmap, prioritization, PMF" },
            ].map((mod) => (
              <div key={mod.label} className="bg-surface border border-border rounded-lg p-6">
                <div className="w-10 h-10 rounded-md bg-background border border-border flex items-center justify-center mb-4">
                  <span className="mono text-[16px] text-faint">?</span>
                </div>
                <p className="text-[22px] leading-[1.15] text-paper">{mod.label}</p>
                <p className="mono text-[11px] tracking-[0.04em] text-muted mt-2">{mod.desc}</p>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          <div className="mt-12 max-w-[520px]">
            {submitted ? (
              <div className="bg-surface border border-border rounded-lg p-6">
                <p className="mono text-[12px] tracking-[0.02em] text-accent">
                  You&apos;re on the list.
                </p>
                <p className="text-[16px] leading-[1.45] text-muted mt-2">
                  We&apos;ll notify you when the next module goes live.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-[16px] text-foreground placeholder:text-faint focus:border-accent/60 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="mono shrink-0 inline-flex items-center justify-center gap-3 bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:bg-accent-dim transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? "..." : "Notify me"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXPERT RECRUITMENT
          ═══════════════════════════════════════════ */}
      <section className="px-6 py-10 md:py-14">
        <div className="max-w-[1008px] mx-auto bg-accent text-[#1B1B18] px-8 md:px-12 py-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[26px] md:text-[32px] leading-none tracking-[0.01em] text-center sm:text-left">
            Have expertise worth preserving?
          </p>
          <Link
            href="/apply"
            className="mono shrink-0 bg-[#1B1B18] text-paper px-8 py-3.5 text-[12px] tracking-[0.08em] hover:bg-[#2A2A26] transition"
          >
            APPLY TO BECOME AN EXPERT
          </Link>
        </div>
      </section>
    </div>
  );
}
