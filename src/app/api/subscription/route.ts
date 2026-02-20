import { isSubscribed } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return Response.json({ subscribed: false });
    }
    const active = await isSubscribed(email);
    return Response.json({ subscribed: active });
  } catch {
    return Response.json({ subscribed: false });
  }
}
