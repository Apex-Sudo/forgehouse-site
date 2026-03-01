import { Redis } from "@upstash/redis";

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

const PREFIX = "fh:sub:";
const FREE_PREFIX = "fh:free:";
const AUTH_FREE_PREFIX = "fh:free:auth:";

const ANONYMOUS_FREE_MESSAGES = 3;
const AUTHENTICATED_FREE_MESSAGES = 2; // 2 more after login (5 total)

// --- Subscription management ---

export async function setSubscriptionActive(email: string, stripeCustomerId: string) {
  await redis().set(`${PREFIX}${email.toLowerCase()}`, {
    active: true,
    customerId: stripeCustomerId,
    updatedAt: Date.now(),
  });
}

export async function setSubscriptionInactive(email: string) {
  await redis().set(`${PREFIX}${email.toLowerCase()}`, {
    active: false,
    updatedAt: Date.now(),
  });
}

export async function isSubscribed(email: string): Promise<boolean> {
  const data = await redis().get<{ active: boolean }>(`${PREFIX}${email.toLowerCase()}`);
  return data?.active === true;
}

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

// --- Access check: tiered gating ---

export async function canAccess(
  ip: string,
  email?: string
): Promise<{ allowed: boolean; reason: "free" | "subscribed" | "login_required" | "paywall" }> {
  // If subscribed, always allow
  if (email) {
    const active = await isSubscribed(email);
    if (active) return { allowed: true, reason: "subscribed" };
  }

  // Check anonymous messages
  const anonCount = await getAnonymousMessageCount(ip);

  if (!email) {
    // No email: check anonymous tier
    if (anonCount < ANONYMOUS_FREE_MESSAGES) {
      return { allowed: true, reason: "free" };
    }
    return { allowed: false, reason: "login_required" };
  }

  // Has email but not subscribed: check authenticated tier
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
