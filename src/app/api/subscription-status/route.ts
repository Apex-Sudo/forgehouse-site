import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ subscribed: false });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return Response.json({ subscribed: false });
    }

    const { data: user } = await supabase
      .from("users")
      .select("subscribed, subscribed_mentor_slugs")
      .eq("id", userId)
      .single();

    return Response.json({
      subscribed: user?.subscribed ?? false,
      mentorSlugs: user?.subscribed_mentor_slugs ?? [],
    });
  } catch {
    return Response.json({ subscribed: false });
  }
}
