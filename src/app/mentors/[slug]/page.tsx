import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import MentorMarketingClient from "./MentorMarketingClient";
import {
  mentorLandingContentSchema,
  type MentorLandingContent,
} from "@/types/mentor-landing";

export const dynamic = "force-dynamic";

type MentorRow = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
};

function humanizeSlug(slug: string): string {
  if (typeof slug !== "string" || slug.length === 0) {
    return "";
  }
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function mentorRowFromLanding(slug: string, marketing: MentorLandingContent): MentorRow {
  const profile = marketing.profileImageUrl?.trim();
  const quote = marketing.heroQuote.trim();
  return {
    slug,
    name: humanizeSlug(slug),
    tagline: quote.length > 0 ? marketing.heroQuote : "",
    avatar_url: profile && profile.length > 0 ? profile : "",
    bio: null,
  };
}

export async function generateStaticParams() {
  const { data: landingRows } = await supabase
    .from("mentor_landing_pages")
    .select("slug")
    .eq("published", true);

  return (landingRows ?? [])
    .filter((r): r is { slug: string } => typeof r.slug === "string" && r.slug.length > 0)
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const [{ data: mentorRow }, { data: landingRow }] = await Promise.all([
    supabase
      .from("mentors")
      .select("name, tagline, bio")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("mentor_landing_pages")
      .select("content")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle(),
  ]);

  const parsed = landingRow?.content
    ? mentorLandingContentSchema.safeParse(landingRow.content)
    : null;

  if (!mentorRow && !parsed?.success) {
    return { title: "Mentor Not Found | ForgeHouse" };
  }

  const displayName = mentorRow?.name ?? humanizeSlug(slug);
  const title = `${displayName} | ForgeHouse`;

  const heroDescription = parsed?.success ? parsed.data.heroDescription.trim() : "";
  const description =
    heroDescription.length > 0
      ? heroDescription
      : (mentorRow?.bio?.trim() || `Learn more about ${displayName} on ForgeHouse.`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://forgehouse.io/mentors/${slug}`,
      type: "website",
      siteName: "ForgeHouse",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MentorMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /* The "Know your expert" view is driven by the mentors table, so every active
     expert has a page. A published landing row is optional and only adds the
     richer marketing sections below the hero. */
  const [{ data: mentorRow }, { data: landingRow }] = await Promise.all([
    supabase
      .from("mentors")
      .select("slug, name, tagline, avatar_url, bio")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("mentor_landing_pages")
      .select("content")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle(),
  ]);

  let marketing: MentorLandingContent | null = null;
  if (landingRow?.content) {
    const parsed = mentorLandingContentSchema.safeParse(landingRow.content);
    if (parsed.success) {
      marketing = parsed.data;
    }
  }

  /* Fall back to the landing row so a published page still renders if the
     mentors row is missing; only a genuinely unknown slug 404s. */
  const mentor: MentorRow | null =
    (mentorRow as MentorRow | null) ??
    (marketing ? mentorRowFromLanding(slug, marketing) : null);

  if (!mentor) {
    // Renders not-found.tsx with a real HTTP 404 rather than serving the
    // "not found" page as a 200, which search engines would index.
    notFound();
  }

  return <MentorMarketingClient mentor={mentor} marketing={marketing} />;
}
