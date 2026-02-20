import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, linkedin, role, expertise, whyForgeHouse, contentLink } = await req.json();

    if (!name || !email || !linkedin || !role || !expertise || !whyForgeHouse) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    // Log for now. Wire email forwarding later.
    console.log("[mentor-application]", { name, email, linkedin, role, expertise, whyForgeHouse, contentLink, ts: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
