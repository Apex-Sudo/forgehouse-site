import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

const EXTEND_MS = 7 * 24 * 60 * 60 * 1000;

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

  const { data: row, error: fetchErr } = await supabase
    .from("onboarding_sessions")
    .select("id, expires_at")
    .eq("id", id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json(
      { error: "Onboarding session not found" },
      { status: 404 }
    );
  }

  const current = new Date(row.expires_at).getTime();
  const next = new Date(current + EXTEND_MS).toISOString();

  const { data: updated, error: updateErr } = await supabase
    .from("onboarding_sessions")
    .update({ expires_at: next, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, expires_at")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to extend expiry" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, expiresAt: updated.expires_at });
}
