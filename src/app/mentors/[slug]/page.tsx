import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import MentorMarketingClient from "./MentorMarketingClient";
import {
  mentorLandingContentSchema,
  type MentorLandingContent,
} from "@/types/mentor-landing";

type MentorRow = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
};

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function generateStaticParams() {
  const [{ data: mentorRows }, { data: landingRows }] = await Promise.all([
    supabase.from("mentors").select("slug").eq("is_active", true),
    supabase
      .from("mentor_landing_pages")
      .select("slug")
      .eq("published", true),
  ]);
  const slugs = new Set<string>();
  for (const m of mentorRows ?? []) slugs.add(m.slug);
  for (const r of landingRows ?? []) slugs.add(r.slug);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: mentor } = await supabase
    .from("mentors")
    .select("name, tagline, bio")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (mentor) {
    const title = `${mentor.name} | ${mentor.tagline}`;
    const description =
      mentor.bio && mentor.bio.trim().length > 0
        ? mentor.bio
        : `Chat with ${mentor.name} on ForgeHouse.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://forgehouse.io/mentors/${slug}`,
        type: "profile",
        siteName: "ForgeHouse",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  const { data: landingRow } = await supabase
    .from("mentor_landing_pages")
    .select("content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const parsed = landingRow?.content
    ? mentorLandingContentSchema.safeParse(landingRow.content)
    : null;
  if (parsed?.success) {
    const displayName = humanizeSlug(slug);
    const title = `${displayName} | ForgeHouse`;
    const description =
      parsed.data.heroDescription.trim().length > 0
        ? parsed.data.heroDescription
        : `Learn more about ${displayName} on ForgeHouse.`;

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

  return { title: "Mentor Not Found | ForgeHouse" };
}

export default async function MentorMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data: mentor }, { data: landingRow }] = await Promise.all([
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

  if (mentor) {
    return (
      <MentorMarketingClient mentor={mentor as MentorRow} marketing={marketing} />
    );
  }

  if (marketing) {
    const profile = marketing.profileImageUrl?.trim();
    const quote = marketing.heroQuote.trim();
    const synthetic: MentorRow = {
      slug,
      name: humanizeSlug(slug),
      tagline: quote.length > 0 ? marketing.heroQuote : "",
      avatar_url: profile && profile.length > 0 ? profile : "",
      bio: null,
    };
    return <MentorMarketingClient mentor={synthetic} marketing={marketing} />;
  }

  return (
    <div className="pt-32 text-center">
      <h1 className="text-2xl font-bold mb-2">Mentor not found</h1>
      <Link href="/mentors" className="text-amber hover:text-amber-dark">Browse all mentors</Link>
    </div>
  );
}
