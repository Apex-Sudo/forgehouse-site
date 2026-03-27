import { auth } from "@/lib/auth";
import { getConversation, deleteConversation, renameConversation } from "@/lib/conversations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await getConversation(id, user.id, user.email);
    if (!data) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(data);
  } catch (err) {
    console.error("Get conversation error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteConversation(id, user.id, user.email);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Delete conversation error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title } = (await req.json()) as { title?: string };
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return Response.json({ error: "title required" }, { status: 400 });
    }
    await renameConversation(id, user.id, user.email, title.trim());
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Rename conversation error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
