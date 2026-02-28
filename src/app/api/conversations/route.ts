import { auth } from "@/lib/auth";
import { listConversations, createConversation } from "@/lib/conversations";

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mentor = searchParams.get("mentor");
  if (!mentor) {
    return Response.json({ error: "mentor param required" }, { status: 400 });
  }

  try {
    const data = await listConversations(user.id, mentor, user.email);
    return Response.json(data);
  } catch (err) {
    console.error("List conversations error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mentor_slug } = await req.json();
    if (!mentor_slug) {
      return Response.json({ error: "mentor_slug required" }, { status: 400 });
    }

    const data = await createConversation(user.id, mentor_slug, user.email);
    return Response.json(data);
  } catch (err) {
    console.error("Create conversation error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
