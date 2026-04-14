import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOnboardingInvitation } from "@/lib/emails";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "https://forgehouse.io";
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

  const { data: row, error } = await supabase
    .from("onboarding_sessions")
    .select("id, mentor_name, email, expires_at")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json(
      { error: "Onboarding session not found" },
      { status: 404 }
    );
  }

  const now = new Date();
  if (new Date(row.expires_at) < now) {
    return NextResponse.json(
      { error: "Session has expired. Extend expiry before resending." },
      { status: 400 }
    );
  }

  const onboardingLink = `${getBaseUrl()}/onboard/${row.id}`;

  await sendOnboardingInvitation({
    to: row.email,
    mentorName: row.mentor_name,
    onboardingLink,
  });

  return NextResponse.json({ ok: true });
}
