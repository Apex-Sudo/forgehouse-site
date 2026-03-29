import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("mentors")
    .select("slug, name, tagline, avatar_url, monthly_price")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("Mentors fetch error:", error);
    return Response.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }

  return Response.json({ mentors: data });
}
