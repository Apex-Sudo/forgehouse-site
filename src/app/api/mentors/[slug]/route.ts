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
