import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { slug, messages } = await req.json();

    if (!slug || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await supabase
      .from("fh_sessions")
      .upsert(
        {
          slug,
          type: "calibration",
          messages,
          exchange_count: messages.filter((m: { role: string }) => m.role === "user").length,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug,type" }
      );

    if (error) {
      console.error("[calibrate-save] Supabase error:", error);
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[calibrate-save]", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
