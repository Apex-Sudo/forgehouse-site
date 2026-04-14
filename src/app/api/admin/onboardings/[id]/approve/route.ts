import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { id } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("onboarding_sessions")
    .update({
      agent_approved: true,
      agent_approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, mentor_name, agent_approved, agent_approved_at")
    .maybeSingle();

  if (error) {
    console.error("approve onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve agent" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Onboarding session not found" },
      { status: 404 }
    );
  }

  const slug = toSlug(data.mentor_name);
  const { error: mentorError } = await supabase
    .from("mentors")
    .update({
      is_active: true,
      active: true,
    })
    .eq("slug", slug);

  if (mentorError) {
    console.error("approve onboarding mentor is_active:", mentorError);
    return NextResponse.json(
      { error: mentorError.message || "Approved session but failed to update mentor" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, ...data });
}
