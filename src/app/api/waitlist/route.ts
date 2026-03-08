import { supabase } from "@/lib/supabase";
import { formLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { success } = await formLimiter().limit(ip);
    if (!success) {
      return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    // Upsert to avoid duplicates
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });

    if (error) {
      console.error("Waitlist error:", error.message);
      return Response.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
