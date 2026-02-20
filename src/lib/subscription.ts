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
