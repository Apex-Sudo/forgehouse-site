import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnonymousMessageCount, getAuthenticatedMessageCount, isSubscribedToMentor } from "@/lib/subscription";

const ANONYMOUS_FREE_MESSAGES = 3;
const AUTHENTICATED_FREE_MESSAGES = 2;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const session = await auth();
  const email = (session?.user as { email?: string })?.email;
  const userId = (session?.user as { id?: string })?.id;
  
  // Get mentorSlug from query params
  const mentorSlug = req.nextUrl.searchParams.get("mentor");

  // If user is logged in and subscribed to this mentor, allow access
  if (userId && mentorSlug) {
    const subscribed = await isSubscribedToMentor(userId, mentorSlug);
    if (subscribed) {
      return NextResponse.json({ gate: "none", remaining: null });
    }
  }

  // Check authenticated free messages (if logged in)
  if (email) {
    const authCount = await getAuthenticatedMessageCount(email);
    const remaining = Math.max(0, AUTHENTICATED_FREE_MESSAGES - authCount);
    return NextResponse.json({
      gate: remaining <= 0 ? "paywall" : "none",
      remaining,
    });
  }

  // Check anonymous free messages
  const anonCount = await getAnonymousMessageCount(ip);
  const remaining = Math.max(0, ANONYMOUS_FREE_MESSAGES - anonCount);
  return NextResponse.json({
    gate: remaining <= 0 ? "login" : "none",
    remaining,
  });
}
