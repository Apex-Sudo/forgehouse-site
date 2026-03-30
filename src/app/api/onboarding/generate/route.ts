import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

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

    // Generate the unique link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const onboardingLink = `${baseUrl}/onboard/${data.id}`;

    return NextResponse.json({
      sessionId: data.id,
      onboardingLink,
      mentorName,
      email
    });
  } catch (error) {
    console.error("Error generating onboarding link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
