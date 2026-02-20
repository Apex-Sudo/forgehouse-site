import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, expertise } = await req.json();

    if (!name || !email || !expertise) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Log for now. Wire Resend or webhook later.
    console.log("[mentor-signup]", { name, email, expertise, ts: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
