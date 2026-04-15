"use client";
import Link from "next/link";
import { ChatCircleDots, Star, LinkedinLogo } from "@phosphor-icons/react";
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

  return (
    <div className="pt-16">
      <section className="gradient-hero px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <img
              src={avatarSrc}
              alt={mentor.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border border-border-light shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />
            <div className="flex-1">
              <p className="text-amber text-sm font-semibold mb-2 tracking-wide uppercase">
                ForgeHouse Expert
              </p>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                {mentor.name}
              </h1>
              <p className="text-muted text-lg md:text-xl leading-relaxed mb-2">
                {mentor.tagline}
              </p>
              <p className="text-muted text-base leading-relaxed mb-6">
                {heroDescription}
              </p>
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {highlights.map((h) => (
                    <div
                      key={h.label}
                      className="flex items-center gap-2 text-sm text-muted border border-glass-border rounded-full px-3.5 py-1.5"
                    >
                      {h.label}
                    </div>
                  ))}
                </div>
              )}
              {heroQuote && (
                <div className="pl-5 border-l-2 border-amber/20 mb-8">
                  <p className="text-foreground/40 italic text-[14px] leading-relaxed">
                    &ldquo;{heroQuote}&rdquo;
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/chat/${mentor.slug}`}
                  className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition text-center inline-flex items-center justify-center gap-2"
                >
                  <ChatCircleDots size={20} />
                  Chat with the agent
                </Link>
                {externalLink && (
                  <a
                    href={externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-glass-border text-muted px-5 py-3.5 rounded-xl font-semibold hover:text-foreground hover:border-white/20 transition text-center inline-flex items-center justify-center gap-2 text-sm"
                  >
                    {externalLink.url.includes("linkedin") && (
                      <LinkedinLogo size={18} />
                    )}
                    {externalLink.url.includes("airbnb") && (
                      <Star size={18} />
                    )}
                    {externalLink.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {sessions.length > 0 && (
        <section className="px-6 pt-10 pb-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              The problem
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Sound familiar?
            </h2>
            <p className="text-muted text-base mb-10 max-w-2xl">
              {problemSubtitle}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {sessions.map((s) => (
                <div key={s.num} className="flex flex-col gap-3">
                  <span className="font-mono text-[13px] text-amber/60">
                    {s.num}
                  </span>
                  <p className="font-semibold text-base">{s.title}</p>
                  <p className="text-muted text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/chat/${mentor.slug}`}
                className="text-amber text-[14px] hover:text-foreground transition"
              >
                Start with any of these &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {companies && companies.length > 0 && (
        <section className="px-6 py-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-8 text-center">
              Companies worked with
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6 items-center justify-items-center">
              {companies.map((c, i) => (
                <img
                  key={`${i}-${c.src}`}
                  src={c.src}
                  alt={c.alt}
                  className={`${LOGO_HEIGHT_TW[companyLogoHeightClass(c.h)]} w-auto object-contain opacity-40 brightness-0`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {pillars.length > 0 && (
        <section className="px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              The agent
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              How {firstName}&apos;s agent thinks
            </h2>
            <p className="text-muted text-base mb-10 max-w-2xl">
              {pillarSubtitle}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((p) => (
                <div key={p.title} className="glass-card p-6">
                  <p className="font-semibold mb-2 text-sm">{p.title}</p>
                  <p className="text-muted text-sm">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {reviews && reviews.length > 0 && (
        <section className="px-6 py-14">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
              Reviews
            </p>
            <div className="flex items-center gap-3 mb-10">
              <h2 className="text-xl md:text-2xl font-bold">
                What people say
              </h2>
              {marketing?.reviewRating && (
                <div className="flex items-center gap-1.5 text-amber">
                  <Star size={16} weight="fill" />
                  <span className="font-semibold">{marketing.reviewRating}</span>
                  {marketing.reviewSource &&
                    marketing.reviewSource.label.trim().length > 0 && (
                      <span className="text-muted text-xs ml-1">
                        {marketing.reviewSource.label}
                      </span>
                    )}
                </div>
              )}
            </div>
            {featuredReview && (
              <div className="glass-card p-8 md:p-10 mb-6">
                <p className="text-foreground/90 text-lg leading-relaxed mb-5 italic">
                  &ldquo;{featuredReview.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">
                    {featuredReview.author}
                  </p>
                  <p className="text-muted text-xs">{featuredReview.role}</p>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-4">
              {otherReviews.map((r) => (
                <div key={r.author} className="glass-card p-5">
                  <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-xs">{r.author}</p>
                    <p className="text-muted text-[11px]">{r.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
            Try it
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            {tryItHeading}
          </h2>
          <p className="text-muted text-base mb-10 max-w-xl mx-auto">
            {starters.length > 0
              ? "Pick one, or describe your situation."
              : "Describe your situation below, or open chat to begin."}
          </p>
          {starters.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-10">
              {starters.map((s, i) => (
                <Link
                  key={`${i}-${s}`}
                  href={`/chat/${mentor.slug}?q=${encodeURIComponent(s)}`}
                  className="glass-card p-4 text-sm text-left hover:border-amber/20 transition text-muted hover:text-foreground"
                >
                  {s}
                </Link>
              ))}
            </div>
          ) : null}
          <Link
            href={`/chat/${mentor.slug}`}
            className="bg-amber text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-amber-dark transition inline-flex items-center gap-2"
          >
            <ChatCircleDots size={20} />
            Chat with the agent
          </Link>
          <p className="text-[11px] text-zinc-600 text-center mt-4">
            Your conversations are private. We don&apos;t sell or share your
            data.
          </p>
        </div>
      </section>
    </div>
  );
}
