import { Redis } from "@upstash/redis";
import { supabase } from "@/lib/supabase";

let _redis: Redis | null = null;

function redis() {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

const FREE_PREFIX = "fh:free:";
const AUTH_FREE_PREFIX = "fh:free:auth:";

const ANONYMOUS_FREE_MESSAGES = 3;
const AUTHENTICATED_FREE_MESSAGES = 2; // 2 more after login (5 total)

// Whitelisted IPs bypass all gating
const WHITELISTED_IPS = new Set(
  (process.env.WHITELISTED_IPS || "").split(",").map((ip) => ip.trim()).filter(Boolean)
);

// --- Anonymous message tracking (by IP) ---

export async function getAnonymousMessageCount(ip: string): Promise<number> {
  const count = await redis().get<number>(`${FREE_PREFIX}${ip}`);
  return count ?? 0;
}

export async function incrementAnonymousMessages(ip: string): Promise<void> {
  const key = `${FREE_PREFIX}${ip}`;
  const exists = await redis().exists(key);
  await redis().incr(key);
  if (!exists) {
    await redis().expire(key, 30 * 24 * 60 * 60);
  }
}

// --- Authenticated message tracking (by email) ---

export async function getAuthenticatedMessageCount(email: string): Promise<number> {
  const count = await redis().get<number>(`${AUTH_FREE_PREFIX}${email.toLowerCase()}`);
  return count ?? 0;
}

export async function incrementAuthenticatedMessages(email: string): Promise<void> {
  const key = `${AUTH_FREE_PREFIX}${email.toLowerCase()}`;
  const exists = await redis().exists(key);
  await redis().incr(key);
  if (!exists) {
    await redis().expire(key, 30 * 24 * 60 * 60);
  }
}

// --- Legacy access check (for backward compat during transition) ---

export async function canAccess(
  ip: string,
  email?: string
): Promise<{ allowed: boolean; reason: "free" | "subscribed" | "login_required" | "paywall" }> {
  // Whitelisted IPs bypass all gating
  if (WHITELISTED_IPS.has(ip)) return { allowed: true, reason: "free" };

  // Check anonymous messages
  const anonCount = await getAnonymousMessageCount(ip);

  if (!email) {
    // No email: check anonymous tier
    if (anonCount < ANONYMOUS_FREE_MESSAGES) {
      return { allowed: true, reason: "free" };
    }
    return { allowed: false, reason: "login_required" };
  }

  // Has email: check authenticated tier
  const authCount = await getAuthenticatedMessageCount(email);
  if (authCount < AUTHENTICATED_FREE_MESSAGES) {
    return { allowed: true, reason: "free" };
  }

  return { allowed: false, reason: "paywall" };
}

// Legacy exports for backward compat
export async function hasFreeMessages(ip: string): Promise<boolean> {
  const count = await getAnonymousMessageCount(ip);
  return count < ANONYMOUS_FREE_MESSAGES;
}

export async function incrementFreeMessages(ip: string): Promise<void> {
  return incrementAnonymousMessages(ip);
}

// Legacy isSubscribed for backward compatibility with conversations.ts
// Checks Redis authenticated subscription status
export async function isSubscribed(email: string): Promise<boolean> {
  const count = await getAuthenticatedMessageCount(email);
  // If user has exceeded free message count, they are considered subscribed (legacy behavior)
  return count >= AUTHENTICATED_FREE_MESSAGES;
}

// --- Mentor-specific subscription checks ---

export async function isSubscribedToMentor(
  userId: string,
  mentorSlug: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("subscribed_mentor_slugs")
      .eq("id", userId)
      .single();

    if (error || !data?.subscribed_mentor_slugs) {
      return false;
    }

    return data.subscribed_mentor_slugs.includes(mentorSlug);
  } catch {
    return false;
  }
}

export async function canAccessMentor(
  userId: string,
  email: string | undefined,
  ip: string,
  mentorSlug: string,
  isFree: boolean = false
): Promise<{ allowed: boolean; reason: "free" | "subscribed" | "login_required" | "paywall" }> {
  if (isFree) return { allowed: true, reason: "free" };

  // If user has this mentor in their subscribed list, allow
  if (userId) {
    const subscribed = await isSubscribedToMentor(userId, mentorSlug);
    if (subscribed) return { allowed: true, reason: "subscribed" };
  }

  // Fall back to legacy checks (IP-based, email-based free tiers)
  const legacyResult = await canAccess(ip, email);
  if (legacyResult.allowed) {
    return legacyResult;
  }

  if (!email) {
    return { allowed: false, reason: "login_required" };
  }

  return { allowed: false, reason: "paywall" };
}

// --- Legacy mutation APIs kept for build compatibility ---

export async function setSubscriptionActive(email: string, _customerId?: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await supabase
    .from("users")
    .update({ subscribed: true })
    .eq("email", normalizedEmail);
}

export async function setSubscriptionInactive(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await supabase
    .from("users")
    .update({ subscribed: false })
    .eq("email", normalizedEmail);
}
