import Link from "next/link";
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

  const { data: landingRow } = await supabase
    .from("mentor_landing_pages")
    .select("content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  let marketing: MentorLandingContent | null = null;
  if (landingRow?.content) {
    const parsed = mentorLandingContentSchema.safeParse(landingRow.content);
    if (parsed.success) {
      marketing = parsed.data;
    }
  }

  if (marketing) {
    return (
      <MentorMarketingClient
        mentor={mentorRowFromLanding(slug, marketing)}
        marketing={marketing}
      />
    );
  }

  return (
    <div className="pt-16 md:pt-[72px]">
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-[1008px] mx-auto">
          <p className="mono text-[13px] text-accent mb-4">404</p>
          <h1 className="text-[44px] md:text-[64px] leading-[0.92] tracking-[-0.015em]">
            Mentor not found
          </h1>
          <Link
            href="/mentors"
            className="mono inline-flex items-center gap-3 mt-8 border border-border-light text-foreground px-6 py-3 rounded-md text-[12px] tracking-[0.02em] hover:border-accent hover:text-accent transition"
          >
            Browse all mentors
            <span aria-hidden="true">›</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
