"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, LinkedinLogo } from "@phosphor-icons/react";
import ClipButton from "@/components/ui/ClipButton";
import { getExpertProfile } from "@/lib/expert-profile";
import {
  companyLogoHeightClass,
  type MentorLandingCompanyLogoHeight,
  type MentorLandingContent,
} from "@/types/mentor-landing";

const LOGO_HEIGHT_TW: Record<MentorLandingCompanyLogoHeight, string> = {
  "h-6": "h-6",
  "h-7": "h-7",
  "h-8": "h-8",
  "h-9": "h-9",
  "h-10": "h-10",
  "h-11": "h-11",
  "h-12": "h-12",
};

const FALLBACK_AVATAR = "/mentors/default-avatar.svg";
function safeAvatar(url: string | undefined | null): string {
  if (!url || url.includes("default-avatar.png")) return FALLBACK_AVATAR;
  return url;
}

export interface MentorRow {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
}

export default function MentorMarketingClient({
  mentor,
  marketing,
}: {
  mentor: MentorRow;
  marketing: MentorLandingContent | null;
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSub, setCheckingSub] = useState(false);
  const [mentorPrice, setMentorPrice] = useState<{ monthlyPrice: number } | null>(null);

  const slug = mentor.slug;

  useEffect(() => {
    if (!slug) return;
    setCheckingSub(true);
    // Check subscription status
    fetch(`/api/subscription-status?mentor=${slug}`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setIsSubscribed(data.isSubscribed);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSub(false));

    // Fetch mentor price
    fetch(`/api/mentors/${slug}/pricing`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setMentorPrice({ monthlyPrice: data.monthlyPrice });
        }
      })
      .catch(() => {});
  }, [slug]);

  const handlePayNow = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorSlug: slug }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch {
      window.location.href = "/pricing";
    }
  };

  const firstName = mentor.name.split(" ")[0];
  const starters = (marketing?.chatStarters ?? []).filter(
    (s) => s.trim().length > 0
  );

  const heroDescription =
    marketing?.heroDescription ?? mentor.bio ?? "";
  const heroQuote = marketing?.heroQuote;
  const highlights = marketing?.highlights ?? [];
  const sessions = marketing?.sessions ?? [];
  const problemSubtitle = marketing?.problemSubtitle ?? "";
  const pillars = marketing?.pillars ?? [];
  const pillarSubtitle = marketing?.pillarSubtitle ?? "";
  const tryItHeading =
    marketing?.tryItHeading ?? `Ask ${firstName} anything`;
  const reviews = marketing?.reviews;
  const companies = marketing?.companies;
  const externalLink = marketing?.externalLink;

  const featuredReview = reviews?.find((r) => r.featured);
  const otherReviews = reviews?.filter((r) => !r.featured) ?? [];

  const profileImageOverride = marketing?.profileImageUrl?.trim();
  const avatarSrc = safeAvatar(
    profileImageOverride && profileImageOverride.length > 0
      ? profileImageOverride
      : mentor.avatar_url
  );

  const priceLabel =
    mentorPrice?.monthlyPrice === 0
      ? "Free"
      : `$${Math.floor((mentorPrice?.monthlyPrice ?? 0) / 100)}`;

  /* The landing row derives `tagline` from `heroQuote`, so the specialty line
     comes from the shared expert profile to avoid printing the quote twice. */
  const expertProfile = getExpertProfile(mentor.slug, mentor.tagline);
  const specialty = expertProfile.specialty;
  const showHeroQuote = Boolean(heroQuote) && heroQuote !== specialty;

  /* Uppercase mono credential lines, per the "Know your expert" design. Falls
     back to the landing row's highlight labels for experts with no profile entry. */
  const credentials =
    expertProfile.highlights.length > 0
      ? expertProfile.highlights
      : highlights.map((h) => h.label).filter((l) => l.trim().length > 0);

  /* Shared subscribe / try-free action row. */
  const actions = (
    <>
      {checkingSub ? (
        <span className="mono inline-flex items-center gap-3 border border-border-light text-muted px-6 py-3 rounded-md text-[12px] tracking-[0.02em]">
          Checking...
        </span>
      ) : isSubscribed ? (
        <button
          disabled
          className="mono inline-flex items-center gap-3 bg-surface text-faint px-6 py-3 rounded-md text-[12px] tracking-[0.02em] cursor-not-allowed"
        >
          Subscribed
        </button>
      ) : (
        /* "Chat with <name>" is the primary CTA in the hero, so this row only
           carries the commercial action. */
        <button
          onClick={handlePayNow}
          className="mono inline-flex items-center gap-3 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition cursor-pointer"
        >
          Subscribe {priceLabel}/mo
          <span aria-hidden="true">›</span>
        </button>
      )}
    </>
  );

  return (
    <div className="pt-16 md:pt-[72px]">
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="px-6 pt-12 md:pt-16 pb-16 md:pb-20">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-8">Know your expert</p>

          <div className="grid md:grid-cols-[374px_1fr] gap-8 md:gap-[35px] items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={mentor.name}
              className="w-full md:w-[374px] aspect-[374/552] object-cover object-top bg-surface rounded-[4px]"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />

            <div>
              <h1 className="text-[38px] md:text-[46px] uppercase leading-[1] tracking-[0.01em] text-paper">
                {mentor.name}
              </h1>
              {specialty && (
                <p className="text-[21px] md:text-[24px] italic text-accent mt-1">
                  {specialty}
                </p>
              )}

              {credentials.length > 0 && (
                <ul className="mt-6 space-y-0.5">
                  {credentials.map((c) => (
                    <li
                      key={c}
                      className="mono text-[11px] tracking-[0.04em] uppercase text-muted"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              {heroDescription && (
                <div className="mt-7 max-w-[630px] rounded-[4px] border border-accent/25 px-6 py-5">
                  <p className="text-[16px] leading-[1.5] text-foreground/80 whitespace-pre-line">
                    {heroDescription}
                  </p>
                </div>
              )}

              {showHeroQuote && (
                <div className="border-l-2 border-accent pl-6 mt-7 max-w-[630px]">
                  <p className="text-[19px] italic leading-[1.4] text-foreground">
                    &ldquo;{heroQuote}&rdquo;
                  </p>
                </div>
              )}

              <div className="mt-7 max-w-[320px]">
                <ClipButton href={`/chat/${mentor.slug}`} variant="paper">
                  Chat with {firstName}
                </ClipButton>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                {actions}
                {externalLink && (
                  <a
                    href={externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono inline-flex items-center gap-2 text-[12px] tracking-[0.02em] text-muted hover:text-accent transition px-2 py-3"
                  >
                    {externalLink.url.includes("linkedin") && (
                      <LinkedinLogo size={16} />
                    )}
                    {externalLink.url.includes("airbnb") && (
                      <Star size={16} />
                    )}
                    {externalLink.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          THE PROBLEM
          ═══════════════════════════════════════════ */}
      {sessions.length > 0 && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-[1008px] mx-auto">
            <p className="mono text-[13px] text-accent mb-4">The problem</p>
            <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em]">
              Sound familiar?
            </h2>
            {problemSubtitle && (
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[560px]">
                {problemSubtitle}
              </p>
            )}

            <div className="mt-12 grid md:grid-cols-3 gap-x-16 gap-y-12">
              {sessions.map((s) => (
                <div key={s.num}>
                  <p className="mono text-[22px] text-accent mb-3">{s.num}</p>
                  <h3 className="text-[26px] leading-[1.1] mb-3 text-paper">{s.title}</h3>
                  <p className="text-[16px] leading-[1.45] text-muted">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link
                href={`/chat/${mentor.slug}`}
                className="mono text-[12px] tracking-[0.02em] text-accent hover:text-foreground transition"
              >
                Start with any of these &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          COMPANIES
          ═══════════════════════════════════════════ */}
      {companies && companies.length > 0 && (
        <section className="sparkle-field px-6 py-14 md:py-16">
          <div className="max-w-[1008px] mx-auto">
            <p className="mono text-[11px] tracking-[0.06em] uppercase text-faint mb-9 text-center">
              Companies worked with
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
              {companies.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${i}-${c.src}`}
                  src={c.src}
                  alt={c.alt}
                  className={`${LOGO_HEIGHT_TW[companyLogoHeightClass(c.h)]} w-auto object-contain brightness-0 invert opacity-45`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          THE AGENT
          ═══════════════════════════════════════════ */}
      {pillars.length > 0 && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-[1008px] mx-auto">
            <p className="mono text-[13px] text-accent mb-4">The agent</p>
            <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em]">
              How {firstName}&apos;s agent thinks
            </h2>
            {pillarSubtitle && (
              <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[560px]">
                {pillarSubtitle}
              </p>
            )}
            <div className="mt-12 grid md:grid-cols-3 gap-[30px]">
              {pillars.map((p) => (
                <div key={p.title} className="bg-surface border border-border rounded-lg p-7">
                  <h3 className="text-[24px] leading-[1.15] text-paper mb-3">{p.title}</h3>
                  <p className="text-[16px] leading-[1.45] text-muted">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          REVIEWS
          ═══════════════════════════════════════════ */}
      {reviews && reviews.length > 0 && (
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-[1008px] mx-auto">
            <p className="mono text-[13px] text-accent mb-4">Reviews</p>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em]">
                What people say
              </h2>
              {marketing?.reviewRating && (
                <span className="inline-flex items-center gap-1.5 text-accent">
                  <Star size={15} weight="fill" />
                  <span className="mono text-[13px] tracking-[0.02em]">
                    {marketing.reviewRating}
                  </span>
                  {marketing.reviewSource &&
                    marketing.reviewSource.label.trim().length > 0 && (
                      <span className="mono text-[11px] tracking-[0.04em] text-muted ml-1">
                        {marketing.reviewSource.label}
                      </span>
                    )}
                </span>
              )}
            </div>

            {featuredReview && (
              <div className="mt-12 bg-paper text-[#1B1B18] rounded-lg p-8 md:p-10">
                <p className="text-[24px] md:text-[28px] italic leading-[1.25]">
                  &ldquo;{featuredReview.quote}&rdquo;
                </p>
                <div className="w-10 h-px bg-tan my-7" />
                <p className="mono text-[11px] tracking-[0.06em] uppercase text-[#1B1B18]">
                  {featuredReview.author}
                </p>
                <p className="mono text-[11px] tracking-[0.04em] text-[#5C5A52] mt-1">
                  {featuredReview.role}
                </p>
              </div>
            )}

            {otherReviews.length > 0 && (
              <div className="mt-[30px] grid md:grid-cols-3 gap-[30px]">
                {otherReviews.map((r) => (
                  <div key={r.author} className="bg-surface border border-border rounded-lg p-6">
                    <p className="text-[17px] italic leading-[1.45] text-foreground/85">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <div className="w-8 h-px bg-border-light my-5" />
                    <p className="mono text-[11px] tracking-[0.06em] uppercase text-paper">
                      {r.author}
                    </p>
                    <p className="mono text-[11px] tracking-[0.04em] text-muted mt-1">{r.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          TRY IT
          ═══════════════════════════════════════════ */}
      <section className="sparkle-field px-6 py-16 md:py-24">
        <div className="max-w-[1008px] mx-auto text-center">
          <p className="mono text-[13px] text-accent mb-4">Try it</p>
          <h2 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.015em]">
            {tryItHeading}
          </h2>
          <p className="mt-5 text-[17px] leading-[1.5] text-muted max-w-[520px] mx-auto">
            {starters.length > 0
              ? "Pick one, or describe your situation."
              : "Describe your situation below, or open chat to begin."}
          </p>

          {starters.length > 0 ? (
            <div className="mt-12 grid sm:grid-cols-2 gap-[30px] max-w-[760px] mx-auto text-left">
              {starters.map((s, i) => (
                <ClipButton
                  key={`${i}-${s}`}
                  href={`/chat/${mentor.slug}?q=${encodeURIComponent(s)}`}
                  variant="paper"
                >
                  {s}
                </ClipButton>
              ))}
            </div>
          ) : null}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>

          <p className="mono text-[11px] tracking-[0.04em] text-faint mt-6">
            Your conversations are private. We don&apos;t sell or share your data.
          </p>
        </div>
      </section>
    </div>
  );
}
