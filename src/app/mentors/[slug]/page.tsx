import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import MentorMarketingClient from "./MentorMarketingClient";

type MentorRow = {
  slug: string;
  name: string;
  tagline: string;
  avatar_url: string;
  bio: string | null;
  default_starters: string[];
};

export async function generateStaticParams() {
  const { data } = await supabase
    .from("mentors")
    .select("slug")
    .eq("active", true);

  return (data ?? []).map((m) => ({ slug: m.slug }));
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
    .eq("active", true)
    .single();

  if (!mentor) {
    return { title: "Mentor Not Found | ForgeHouse" };
  }

  const title = `${mentor.name} | ${mentor.tagline}`;
  const description = mentor.bio ?? `Chat with ${mentor.name} on ForgeHouse.`;

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

export default async function MentorMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: mentor } = await supabase
    .from("mentors")
    .select("slug, name, tagline, avatar_url, bio, default_starters")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!mentor) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-bold mb-2">Mentor not found</h1>
        <Link href="/mentors" className="text-amber hover:text-amber-dark">Browse all mentors</Link>
      </div>
    );
  }

  return <MentorMarketingClient mentor={mentor as MentorRow} />;
}
