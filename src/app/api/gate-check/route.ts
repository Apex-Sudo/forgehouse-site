import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnonymousMessageCount, getAuthenticatedMessageCount, isSubscribed } from "@/lib/subscription";

const ANONYMOUS_FREE_MESSAGES = 3;
const AUTHENTICATED_FREE_MESSAGES = 2;

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const session = await auth();
  const email = (session?.user as { email?: string })?.email;

  if (email) {
    const active = await isSubscribed(email);
    if (active) {
      return NextResponse.json({ gate: "none", remaining: null });
    }
    const authCount = await getAuthenticatedMessageCount(email);
    const remaining = Math.max(0, AUTHENTICATED_FREE_MESSAGES - authCount);
    return NextResponse.json({
      gate: remaining <= 0 ? "paywall" : "none",
      remaining,
    });
  }

  const anonCount = await getAnonymousMessageCount(ip);
  const remaining = Math.max(0, ANONYMOUS_FREE_MESSAGES - anonCount);
  return NextResponse.json({
    gate: remaining <= 0 ? "login" : "none",
    remaining,
  });
}
