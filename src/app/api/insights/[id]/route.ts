import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/subscription";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const { error } = await supabase
      .from("saved_insights")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Delete insight error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
