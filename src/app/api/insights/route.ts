import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/subscription";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await isSubscribed(user.email);
  if (!active) {
    return Response.json({ error: "Subscription required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mentor = searchParams.get("mentor");

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

  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await isSubscribed(user.email);
  if (!active) {
    return Response.json({ error: "Subscription required" }, { status: 403 });
  }

  try {
    const { mentor_slug, content, source_message_id, tags } = await req.json();
    if (!mentor_slug || !content) {
      return Response.json({ error: "mentor_slug and content required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_insights")
      .insert({
        user_id: user.id,
        mentor_slug,
        content,
        source_message_id: source_message_id ?? null,
        tags: tags ?? [],
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
