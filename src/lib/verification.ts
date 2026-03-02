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

const PREFIX = "fh:verify:";
const CODE_TTL = 600; // 10 minutes
const RATE_PREFIX = "fh:verify-rate:";
const RATE_TTL = 60; // 1 request per 60s per email

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function getExistingCode(email: string): Promise<string | null> {
  const key = `${PREFIX}${email.toLowerCase()}`;
  return await redis().get<string>(key);
}

export async function storeCode(email: string, code: string): Promise<void> {
  const key = `${PREFIX}${email.toLowerCase()}`;
  await redis().set(key, code, { ex: CODE_TTL });
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const key = `${PREFIX}${email.toLowerCase()}`;
  const stored = await redis().get<string>(key);
  if (!stored || stored !== code) return false;
  // Delete after successful verification
  await redis().del(key);
  return true;
}

export async function checkRateLimit(email: string): Promise<boolean> {
  const key = `${RATE_PREFIX}${email.toLowerCase()}`;
  const exists = await redis().exists(key);
  if (exists) return false; // rate limited
  await redis().set(key, "1", { ex: RATE_TTL });
  return true;
}
