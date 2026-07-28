"use client";
import { useEffect, useState } from "react";
import ClipButton from "@/components/ui/ClipButton";
import ExpertPhoto from "@/components/ui/ExpertPhoto";
import { getExpertProfile, firstName, formatMonthlyPrice } from "@/lib/expert-profile";

type Mentor = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
  monthly_price: number | null;
};

export default function PricingPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
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
                  setSubscribed((prev) => ({ ...prev, [mentor.slug]: subData.isSubscribed }));
                }
              } catch {
                /* non-blocking */
              }
            });
          }
        }
      } catch {
        /* non-blocking */
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-16 md:pt-24 pb-20">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-5">Experts Pricing</p>
          <h1 className="text-[56px] md:text-[88px] lg:text-[96px] leading-[0.91] tracking-[-0.02em] max-w-[980px]">
            Pick your Expert &amp; train yourself
          </h1>

          <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-[30px]">
            {loading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] w-full bg-surface" />
                  <div className="h-7 w-2/3 bg-surface mt-5 rounded" />
                  <div className="h-4 w-1/2 bg-surface mt-3 rounded" />
                  <div className="h-24 w-full bg-surface mt-4 rounded" />
                </div>
              ))}

            {!loading && mentors.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p className="text-[24px] text-paper mb-2">No experts available yet</p>
                <p className="mono text-[12px] text-muted">We&apos;re onboarding new experts.</p>
              </div>
            )}

            {mentors.map((m) => {
              const profile = getExpertProfile(m.slug, m.tagline);
              const isSubscribed = subscribed[m.slug];
              return (
                <article key={m.slug} className="flex flex-col">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                    <ExpertPhoto
                      src={m.avatar_url}
                      name={m.name}
                      sizes="(max-width: 768px) 100vw, 316px"
                      className="absolute inset-0"
                    />
                  </div>

                  <h2 className="mt-5 text-[28px] uppercase leading-none tracking-[0.01em] text-paper">
                    {m.name}
                  </h2>
                  <p className="text-[19px] italic text-accent mt-1">{profile.specialty}</p>

                  <ul className="mt-4 space-y-0.5">
                    {profile.highlights.map((h) => (
                      <li key={h} className="mono text-[11px] tracking-[0.04em] text-muted">
                        {h}
                      </li>
                    ))}
                  </ul>

                  <p className="mono text-[15px] tracking-[0.02em] text-accent mt-6 mb-5">
                    {isSubscribed ? "SUBSCRIBED" : formatMonthlyPrice(m.monthly_price)}
                  </p>

                  <div className="mt-auto">
                    <ClipButton href={`/chat/${m.slug}`} variant="paper">
                      {isSubscribed
                        ? `Continue with ${firstName(m.name)}`
                        : `Chat with ${firstName(m.name)}`}
                    </ClipButton>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
