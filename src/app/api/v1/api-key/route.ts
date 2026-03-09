import { auth } from "@/lib/auth";
import { isSubscribed } from "@/lib/subscription";
import { createApiKey, getUserApiKey } from "@/lib/api-keys";

// GET: retrieve existing API key
export async function GET() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;

  if (!user?.id || !user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const active = await isSubscribed(user.email);
  if (!active) {
    return Response.json(
      { error: "Active subscription required", subscribed: false },
      { status: 402 }
    );
  }

  const existingKey = await getUserApiKey(user.id);
  return Response.json({
    api_key: existingKey || null,
    has_key: Boolean(existingKey),
  });
}

// POST: generate new API key (revokes previous)
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;

  if (!user?.id || !user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const active = await isSubscribed(user.email);
  if (!active) {
    return Response.json(
      { error: "Active subscription required", subscribed: false },
      { status: 402 }
    );
  }

  const key = await createApiKey(user.id, user.email);
  return Response.json({
    api_key: key,
    message: "API key generated. Store it securely — it won't be shown again in full.",
  });
}
