import { Redis } from "@upstash/redis";
import * as crypto from "crypto";

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

const API_KEY_PREFIX = "fh:apikey:";
const USER_API_KEY_PREFIX = "fh:user:apikey:";

interface ApiKeyData {
  userId: string;
  email: string;
  createdAt: number;
}

export function generateApiKey(): string {
  return `fh_${crypto.randomBytes(24).toString("hex")}`;
}

export async function createApiKey(userId: string, email: string): Promise<string> {
  // Check if user already has a key
  const existingKey = await redis().get<string>(`${USER_API_KEY_PREFIX}${userId}`);
  if (existingKey) {
    // Revoke old key
    await redis().del(`${API_KEY_PREFIX}${existingKey}`);
  }

  const key = generateApiKey();

  // Store key -> user mapping
  await redis().set(`${API_KEY_PREFIX}${key}`, {
    userId,
    email: email.toLowerCase(),
    createdAt: Date.now(),
  } satisfies ApiKeyData);

  // Store user -> key mapping (for lookup/revoke)
  await redis().set(`${USER_API_KEY_PREFIX}${userId}`, key);

  return key;
}

export async function validateApiKey(key: string): Promise<ApiKeyData | null> {
  if (!key || !key.startsWith("fh_")) return null;
  const data = await redis().get<ApiKeyData>(`${API_KEY_PREFIX}${key}`);
  return data || null;
}

export async function getUserApiKey(userId: string): Promise<string | null> {
  return await redis().get<string>(`${USER_API_KEY_PREFIX}${userId}`);
}

export async function revokeApiKey(userId: string): Promise<void> {
  const key = await redis().get<string>(`${USER_API_KEY_PREFIX}${userId}`);
  if (key) {
    await redis().del(`${API_KEY_PREFIX}${key}`);
    await redis().del(`${USER_API_KEY_PREFIX}${userId}`);
  }
}
