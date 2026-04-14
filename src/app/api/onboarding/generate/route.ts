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

    await sendOnboardingInvitation({
      to: email,
      mentorName,
      onboardingLink,
    });

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
