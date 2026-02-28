import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) {
      return Response.json({ error: "Sign in required." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Profile fetch error:", error);
      return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return Response.json({ profile: data ?? null });
  } catch (err) {
    console.error("Profile route error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
