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

// --- Free message tracking (server-side, by IP) ---

const FREE_MESSAGES = 5;

export async function hasFreeMessages(ip: string): Promise<boolean> {
  const count = await redis().get<number>(`${FREE_PREFIX}${ip}`);
  return (count ?? 0) < FREE_MESSAGES;
}

export async function incrementFreeMessages(ip: string): Promise<void> {
  const key = `${FREE_PREFIX}${ip}`;
  const exists = await redis().exists(key);
  await redis().incr(key);
  if (!exists) {
    // Set 30-day expiry on first message so IPs eventually recycle
    await redis().expire(key, 30 * 24 * 60 * 60);
  }
}

// --- Access check: combines free + subscription ---

export async function canAccess(ip: string, email?: string): Promise<{ allowed: boolean; reason: "free" | "subscribed" | "paywall" }> {
  // If subscribed, always allow
  if (email) {
    const active = await isSubscribed(email);
    if (active) return { allowed: true, reason: "subscribed" };
  }

  // If free messages remaining, allow
  const hasFree = await hasFreeMessages(ip);
  if (hasFree) return { allowed: true, reason: "free" };

  // Otherwise, paywall
  return { allowed: false, reason: "paywall" };
}
