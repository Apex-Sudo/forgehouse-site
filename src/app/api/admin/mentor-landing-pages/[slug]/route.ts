import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { mentorLandingContentSchema } from "@/types/mentor-landing";

const SLUG_RE = /^[a-z0-9-]+$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mentor_landing_pages")
    .select("id, slug, published, content, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("mentor_landing_pages get:", error);
    return NextResponse.json(
      { error: "Failed to load landing page" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ landing: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if ("content" in body) {
    const parsed = mentorLandingContentSchema.safeParse(
      (body as { content: unknown }).content
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), message: "Invalid content" },
        { status: 400 }
      );
    }
    updates.content = parsed.data;
  }

  if ("published" in body) {
    const p = (body as { published: unknown }).published;
    if (typeof p !== "boolean") {
      return NextResponse.json(
        { error: "published must be a boolean" },
        { status: 400 }
      );
    }
    updates.published = p;
  }

  if ("slug" in body && typeof (body as { slug: unknown }).slug === "string") {
    const next = (body as { slug: string }).slug.trim().toLowerCase();
    if (!SLUG_RE.test(next)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (next !== slug) {
      const { data: taken } = await supabase
        .from("mentor_landing_pages")
        .select("id")
        .eq("slug", next)
        .maybeSingle();
      if (taken) {
        return NextResponse.json(
          { error: "That slug is already used by another landing page" },
          { status: 409 }
        );
      }
      updates.slug = next;
    }
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mentor_landing_pages")
    .update(updates)
    .eq("slug", slug)
    .select("id, slug, published, content, created_at, updated_at")
    .maybeSingle();

  if (error) {
    console.error("mentor_landing_pages patch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ landing: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mentor_landing_pages")
    .delete()
    .eq("slug", slug)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("mentor_landing_pages delete:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
