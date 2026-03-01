import { setSubscriptionInactive } from "@/lib/subscription";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return Response.json({ error: "email required" }, { status: 400 });
  }

  await setSubscriptionInactive(email);
  return Response.json({ ok: true, email, status: "inactive" });
}
