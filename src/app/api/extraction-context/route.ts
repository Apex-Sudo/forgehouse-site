import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fh_sessions")
    .select("messages")
    .eq("slug", slug)
    .eq("type", "extraction")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No extraction found" }, { status: 404 });
  }

  const messages = data.messages as { role: string; content: string }[];
  const context = messages
    .map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`)
    .join("\n\n")
    .slice(0, 8000);

  return NextResponse.json({ context });
}
