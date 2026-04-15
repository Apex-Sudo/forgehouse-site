import { z } from "zod";

export const mentorLandingHighlightSchema = z.object({
  label: z.string(),
});

export const mentorLandingSessionSchema = z.object({
  num: z.string(),
  title: z.string(),
  desc: z.string(),
});

export const mentorLandingReviewSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string(),
  featured: z.boolean().optional(),
});

/** Preset heights for company logos (Tailwind); keeps classes in the bundle for public pages. */
export const MENTOR_LANDING_COMPANY_LOGO_HEIGHTS = [
  "h-6",
  "h-7",
  "h-8",
  "h-9",
  "h-10",
  "h-11",
  "h-12",
] as const;

export type MentorLandingCompanyLogoHeight =
  (typeof MENTOR_LANDING_COMPANY_LOGO_HEIGHTS)[number];

export function companyLogoHeightClass(h: string): MentorLandingCompanyLogoHeight {
  if (
    MENTOR_LANDING_COMPANY_LOGO_HEIGHTS.includes(
      h as MentorLandingCompanyLogoHeight
    )
  ) {
    return h as MentorLandingCompanyLogoHeight;
  }
  return "h-7";
}

export const mentorLandingCompanySchema = z.object({
  src: z.string(),
  alt: z.string(),
  h: z.string(),
});

export const mentorLandingPillarSchema = z.object({
  title: z.string(),
  desc: z.string(),
});

export const mentorLandingReviewSourceSchema = z.object({
  label: z.string(),
});

export const mentorLandingExternalLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const mentorLandingContentSchema = z.object({
  /** When set (non-empty), overrides mentor.avatar_url for the hero headshot. */
  profileImageUrl: z.string().nullish(),
  heroDescription: z.string(),
  heroQuote: z.string(),
  highlights: z.array(mentorLandingHighlightSchema),
  sessions: z.array(mentorLandingSessionSchema),
  problemSubtitle: z.string(),
  pillars: z.array(mentorLandingPillarSchema),
  pillarSubtitle: z.string(),
  tryItHeading: z.string(),
  /** Shown as quick-prompt chips on the public mentor page Try it section. */
  chatStarters: z.array(z.string()).default([]),
  reviews: z.array(mentorLandingReviewSchema).optional(),
  reviewRating: z.string().optional(),
  reviewSource: mentorLandingReviewSourceSchema.optional(),
  companies: z.array(mentorLandingCompanySchema).optional(),
  externalLink: mentorLandingExternalLinkSchema.optional(),
});

export type MentorLandingContent = z.infer<typeof mentorLandingContentSchema>;

export function emptyMentorLandingContent(): MentorLandingContent {
  return {
    heroDescription: "",
    heroQuote: "",
    highlights: [],
    sessions: [],
    problemSubtitle: "",
    pillars: [],
    pillarSubtitle: "",
    tryItHeading: "",
    chatStarters: [],
  };
}

export const mentorLandingSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only");
