import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { sendMentorAccountReady } from "@/lib/emails";
import { setSubscriptionActive } from "@/lib/subscription";

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

  const { data: session, error: sessionError } = await supabase
    .from("onboarding_sessions")
    .select("mentor_name, email")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Onboarding session not found" },
      { status: 404 }
    );
  }

  const email = session.email.toLowerCase().trim();
  const slug = toSlug(session.mentor_name);

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("email", email)
    .single();

  if (existingUser) {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        role: "mentor",
        subscribed: true,
        subscribed_mentor_slugs: [slug],
      })
      .eq("id", existingUser.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update existing user" },
        { status: 500 }
      );
    }

    await setSubscriptionActive(email, "admin-mentor");
    await sendMentorAccountReady({ to: email, mentorName: session.mentor_name });

    return NextResponse.json({
      ok: true,
      userId: existingUser.id,
      created: false,
      message: "Existing user upgraded to mentor",
    });
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      email,
      name: session.mentor_name,
      role: "mentor",
      subscribed: true,
      subscribed_mentor_slugs: [slug],
      provider: "admin",
    })
    .select("id")
    .single();

  if (insertError || !newUser) {
    return NextResponse.json(
      { error: "Failed to create mentor account" },
      { status: 500 }
    );
  }

  await setSubscriptionActive(email, "admin-mentor");
  await sendMentorAccountReady({ to: email, mentorName: session.mentor_name });

  return NextResponse.json({
    ok: true,
    userId: newUser.id,
    created: true,
    message: "Mentor account created",
  });
}
