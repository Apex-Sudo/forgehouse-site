import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const FREE_INSIGHT_LIMIT = 3;

async function getUserSubscription(userId: string) {
  const { data } = await supabase
    .from("users")
    .select("subscribed, subscribed_mentor_slugs")
    .eq("id", userId)
    .single();
  return data;
}

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mentor = searchParams.get("mentor");

  // Check subscription status
  const userData = await getUserSubscription(user.id);
  const isSub = userData?.subscribed &&
    userData?.subscribed_mentor_slugs?.includes(mentor ?? "");

  let query = supabase
    .from("saved_insights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (mentor) {
    query = query.eq("mentor_slug", mentor);
  }

  const { data, error } = await query;
  if (error) {
    console.error("List insights error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }

  return Response.json({ insights: data, isSubscribed: !!isSub, limit: isSub ? null : FREE_INSIGHT_LIMIT });
}

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mentor_slug, content, context } = await req.json();
    if (!mentor_slug || !content) {
      return Response.json({ error: "mentor_slug and content required" }, { status: 400 });
    }

    // Check subscription; free users limited to 3
    const userData = await getUserSubscription(user.id);
    const isSub = userData?.subscribed &&
      userData?.subscribed_mentor_slugs?.includes(mentor_slug);

    if (!isSub) {
      const { count } = await supabase
        .from("saved_insights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count ?? 0) >= FREE_INSIGHT_LIMIT) {
        return Response.json({ error: "Free users can save up to 3 insights. Subscribe for unlimited.", code: "INSIGHT_LIMIT" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("saved_insights")
      .insert({
        user_id: user.id,
        mentor_slug,
        content,
        context: context ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    console.error("Save insight error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
