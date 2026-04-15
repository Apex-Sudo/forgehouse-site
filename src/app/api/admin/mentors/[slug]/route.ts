import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

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

  const { slug } = await params;
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mentors")
    .select("slug, name, tagline, avatar_url, bio")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("admin mentor GET:", error);
    return NextResponse.json(
      { error: "Failed to load mentor" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  return NextResponse.json({ mentor: data });
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

  const { slug } = await params;

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const body = await req.json();
  const filtered: Record<string, unknown> = {};
  if ("bio" in body && typeof body.bio === "string") {
    filtered.bio = body.bio;
  }
  if ("avatar_url" in body && typeof body.avatar_url === "string") {
    filtered.avatar_url = body.avatar_url;
  }
  if (
    "monthly_price_usd" in body &&
    typeof body.monthly_price_usd === "number" &&
    Number.isFinite(body.monthly_price_usd) &&
    body.monthly_price_usd >= 0
  ) {
    filtered.monthly_price = Math.round(body.monthly_price_usd * 100);
  }

  if (Object.keys(filtered).length === 0) {
    return NextResponse.json(
      {
        error:
          "Provide bio, avatar_url (strings), and/or monthly_price_usd (number)",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("mentors")
    .update(filtered)
    .eq("slug", slug)
    .select("slug, bio, avatar_url, monthly_price")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  return NextResponse.json({ mentor: data });
}
