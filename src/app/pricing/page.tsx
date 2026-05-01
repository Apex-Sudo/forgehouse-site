"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
};

type MentorPrice = {
  monthlyPrice: number;
};

export default function PricingPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [mentorSubscribed, setMentorSubscribed] = useState<Record<string, boolean>>({});
  const [mentorPrices, setMentorPrices] = useState<Record<string, MentorPrice>>({});

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await fetch("/api/mentors");
        if (res.ok) {
          const data = await res.json();
          const list = data?.mentors;
          if (Array.isArray(list)) {
            setMentors(list);
            list.forEach(async (mentor: Mentor) => {
              try {
                const subRes = await fetch(`/api/subscription-status?mentor=${mentor.slug}`);
                if (subRes.ok) {
                  const subData = await subRes.json();
                  setMentorSubscribed(prev => ({ ...prev, [mentor.slug]: subData.isSubscribed }));
                }
              } catch {}
              try {
                const priceRes = await fetch(`/api/mentors/${mentor.slug}/pricing`);
                if (priceRes.ok) {
                  const priceData = await priceRes.json();
                  setMentorPrices(prev => ({ ...prev, [mentor.slug]: { monthlyPrice: priceData.monthlyPrice } }));
                }
              } catch {}
            });
          }
        }
      } catch {}
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
          Each module is built from one expert's real experience. Choose your mentor.
        </p>
      </section>

      {/* Mentors grid */}
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
                <p className="text-muted text-sm mb-4">We're onboarding new experts.</p>
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

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/chat/${m.slug}`}
                    className="inline-flex items-center justify-center gap-2 bg-amber text-background px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    <ChatCircleDots size={16} weight="bold" />
                    Chat with {m.name.split(" ")[0]}
                  </Link>
                  <Link
                    href={`/mentors/${m.slug}`}
                    className="inline-flex items-center justify-center gap-2 border border-foreground/[0.1] text-muted px-4 py-2.5 rounded-xl font-medium text-sm hover:text-foreground hover:border-foreground/[0.2] transition cursor-pointer"
                  >
                    Learn more
                  </Link>
                  {mentorSubscribed[m.slug] ? (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 bg-foreground/20 text-muted px-4 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed"
                    >
                      Subscribed
                    </button>
                  ) : (
                    <Link
                      href={`/chat/${m.slug}`}
                      className="inline-flex items-center justify-center gap-2 bg-amber text-background px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition cursor-pointer"
                    >
                      Pay ${Math.floor((mentorPrices[m.slug]?.monthlyPrice || 0) / 100)}/mo
                    </Link>
                  )}
                </div>

                <p className="text-xs text-muted text-center">5 free messages. No card required.</p>
              </div>
            ))}
          </div>
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