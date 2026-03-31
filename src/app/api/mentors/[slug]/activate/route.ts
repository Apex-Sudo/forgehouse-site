import { supabase } from "@/lib/supabase";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return Response.json({ error: "Missing slug" }, { status: 400 });
    }

    // Update the mentor to set is_active = true
    const { data, error } = await supabase
      .from("mentors")
      .update({ 
        is_active: true,
        active: true, // Keep the old column for backward compatibility
        created_at: new Date().toISOString()
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      console.error("Error activating mentor:", error);
      return Response.json({ error: "Failed to activate mentor" }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "Mentor not found" }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      mentor: data,
      message: "Mentor activated successfully" 
    });
  } catch (error) {
    console.error("Error in POST /api/mentors/[slug]/activate:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
