import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test inserting a record
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .insert([
        {
          mentor_name: "Test Mentor",
          email: "test@example.com",
          current_phase: "extraction",
          extraction_data: { test: true },
          calibration_data: {},
          ingestion_data: {}
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to insert test record", details: error.message }, { status: 500 });
    }

    // Test querying the record
    const { data: queryData, error: queryError } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("id", data.id)
      .single();

    if (queryError) {
      console.error("Query error:", queryError);
      return NextResponse.json({ error: "Failed to query test record", details: queryError.message }, { status: 500 });
    }

    // Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from("onboarding_sessions")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
    }

    return NextResponse.json({
      success: true,
      message: "Database connection and operations successful",
      insertedRecord: queryData
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
