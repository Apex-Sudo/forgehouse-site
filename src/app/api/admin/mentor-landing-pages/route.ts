import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdminRoute } from "@/lib/admin-route-guard";
import {
  emptyMentorLandingContent,
  mentorLandingContentSchema,
  mentorLandingSlugSchema,
} from "@/types/mentor-landing";

export async function GET() {
  await requireAdminRoute();

  const { data, error } = await supabase
    .from("mentor_landing_pages")
    .select("id, slug, published, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("mentor_landing_pages list:", error);
    return NextResponse.json(
      { error: "Failed to load landing pages" },
      { status: 500 }
    );
  }

  return NextResponse.json({ landings: data ?? [] });
}

export async function POST(req: Request) {
  await requireAdminRoute();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slugParse = mentorLandingSlugSchema.safeParse(
    typeof body === "object" &&
      body !== null &&
      "slug" in body &&
      typeof (body as { slug: unknown }).slug === "string"
      ? (body as { slug: string }).slug
      : ""
  );
  if (!slugParse.success) {
    return NextResponse.json(
      { error: slugParse.error.flatten().formErrors.join(", ") },
      { status: 400 }
    );
  }
  const slug = slugParse.data;

  let content = emptyMentorLandingContent();
  if (
    typeof body === "object" &&
    body !== null &&
    "content" in body &&
    (body as { content: unknown }).content !== undefined
  ) {
    const parsed = mentorLandingContentSchema.safeParse(
      (body as { content: unknown }).content
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), message: "Invalid content" },
        { status: 400 }
      );
    }
    content = parsed.data;
  }

  const published =
    typeof body === "object" &&
    body !== null &&
    "published" in body &&
    typeof (body as { published: unknown }).published === "boolean"
      ? (body as { published: boolean }).published
      : false;

  const { data, error } = await supabase
    .from("mentor_landing_pages")
    .insert({
      slug,
      content,
      published,
      updated_at: new Date().toISOString(),
    })
    .select("id, slug, published, content, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A landing page with this slug already exists" },
        { status: 409 }
      );
    }
    console.error("mentor_landing_pages insert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create landing page" },
      { status: 500 }
    );
  }

  return NextResponse.json({ landing: data });
}
