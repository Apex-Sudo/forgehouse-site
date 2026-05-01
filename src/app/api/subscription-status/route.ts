import { auth } from "@/lib/auth";
import { canAccessMentor } from "@/lib/subscription";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mentorSlug = searchParams.get("mentor");

  if (!mentorSlug) {
    return Response.json({ error: "mentor parameter required" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ isSubscribed: false });
  }

  const userId = (session.user as { id?: string }).id;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const result = await canAccessMentor(
    userId || "",
    session.user.email,
    ip,
    mentorSlug
  );

  return Response.json({ isSubscribed: result.reason === "subscribed" });
}
