import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { data: mentor, error: mentorErr } = await supabase
    .from("mentors")
    .select("slug, name, tagline, avatar_url, welcome_message, default_starters, starters_hint, bio, monthly_price")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (mentorErr || !mentor) {
    return Response.json({ error: "Mentor not found" }, { status: 404 });
  }

  const { data: scenarios } = await supabase
    .from("mentor_scenarios")
    .select("id, title, description, icon, questions, system_prompt_addition, sort_order")
    .eq("mentor_slug", slug)
    .order("sort_order");

  return Response.json({ mentor, scenarios: scenarios ?? [] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const updates = await req.json();
    const allowedFields = [
      "active",
      "tagline",
      "bio",
      "welcome_message",
      "avatar_url",
      "default_starters",
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) filtered[key] = updates[key];
    }

    if (Object.keys(filtered).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("mentors")
      .update(filtered)
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ mentor: data });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
