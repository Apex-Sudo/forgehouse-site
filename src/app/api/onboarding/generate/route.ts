import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { sendOnboardingInvitation } from "@/lib/emails";

// Function to generate a URL-friendly slug from mentor name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length
}

export async function POST(req: Request) {
  try {
    const { mentorName, email } = await req.json();

    // #region agent log
    fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "12fde0",
      },
      body: JSON.stringify({
        sessionId: "12fde0",
        hypothesisId: "H4",
        location: "api/onboarding/generate:POST:parsed",
        message: "generate handler received body",
        data: {
          hasMentorName: Boolean(mentorName),
          hasEmail: Boolean(email),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // Validate input
    if (!mentorName || !email) {
      return NextResponse.json(
        { error: "Mentor name and email are required" },
        { status: 400 }
      );
    }

    // Generate slug from mentor name
    const slug = generateSlug(mentorName);

    // Create a new onboarding session
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .insert([
        {
          mentor_name: mentorName,
          email: email,
          current_phase: "extraction",
          extraction_data: {},
          calibration_data: {},
          ingestion_data: {}
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating onboarding session:", error);
      return NextResponse.json(
        { error: "Failed to create onboarding session" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://forgehouse.io";
    const onboardingLink = `${baseUrl}/onboard/${data.id}`;

    const inviteResult = await sendOnboardingInvitation({
      to: email,
      mentorName,
      onboardingLink,
    });

    if (!inviteResult.ok) {
      const { error: rollbackError } = await supabase
        .from("onboarding_sessions")
        .delete()
        .eq("id", data.id);
      if (rollbackError) {
        console.error(
          "Failed to roll back onboarding session after email error:",
          rollbackError
        );
      }
      // #region agent log
      fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "12fde0",
        },
        body: JSON.stringify({
          sessionId: "12fde0",
          runId: "post-fix",
          hypothesisId: "H3",
          location: "api/onboarding/generate:POST:inviteFailed",
          message: "invite failed — returning error to client",
          data: {
            httpStatus: inviteResult.httpStatus,
            rolledBack: !rollbackError,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return NextResponse.json(
        { error: inviteResult.error },
        { status: inviteResult.httpStatus }
      );
    }

    // #region agent log
    fetch("http://127.0.0.1:7860/ingest/169d6f74-3402-4aca-8edc-53cea3641ed2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "12fde0",
      },
      body: JSON.stringify({
        sessionId: "12fde0",
        runId: "post-fix",
        hypothesisId: "H3",
        location: "api/onboarding/generate:POST:afterInvite",
        message: "sendOnboardingInvitation ok — returning 200 next",
        data: { sessionId: data.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({
      sessionId: data.id,
      onboardingLink,
      mentorName,
      email,
      slug
    });
  } catch (error) {
    console.error("Error generating onboarding link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
