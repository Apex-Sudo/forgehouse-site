import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    // Fetch the onboarding session
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Onboarding session not found" },
        { status: 404 }
      );
    }

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "Onboarding session has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      id: data.id,
      mentorName: data.mentor_name,
      email: data.email,
      currentPhase: data.current_phase,
      extractionData: data.extraction_data,
      calibrationData: data.calibration_data,
      ingestionData: data.ingestion_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at
    });
  } catch (error) {
    console.error("Error fetching onboarding session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    // Map camelCase keys to snake_case for database
    const dbUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      // Convert camelCase to snake_case
      const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      dbUpdates[snakeCaseKey] = value;
    }

    // Update the onboarding session
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating onboarding session:", error);
      return NextResponse.json(
        { error: "Failed to update onboarding session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      mentorName: data.mentor_name,
      email: data.email,
      currentPhase: data.current_phase,
      extractionData: data.extraction_data,
      calibrationData: data.calibration_data,
      ingestionData: data.ingestion_data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at
    });
  } catch (error) {
    console.error("Error updating onboarding session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
