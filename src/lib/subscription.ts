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

// --- Free conversation tracking (server-side, by IP) ---

export async function hasFreeConversation(ip: string): Promise<boolean> {
  const used = await redis().get<number>(`${FREE_PREFIX}${ip}`);
  return !used;
}

export async function markFreeConversationUsed(ip: string): Promise<void> {
  // Set with 30-day expiry so IPs eventually recycle
  await redis().set(`${FREE_PREFIX}${ip}`, 1, { ex: 30 * 24 * 60 * 60 });
}

// --- Access check: combines free + subscription ---

export async function canAccess(ip: string, email?: string): Promise<{ allowed: boolean; reason: "free" | "subscribed" | "paywall" }> {
  // If subscribed, always allow
  if (email) {
    const active = await isSubscribed(email);
    if (active) return { allowed: true, reason: "subscribed" };
  }

  // If free conversation not yet used, allow
  const hasFree = await hasFreeConversation(ip);
  if (hasFree) return { allowed: true, reason: "free" };

  // Otherwise, paywall
  return { allowed: false, reason: "paywall" };
}
