import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Rate limiting fails OPEN.
 *
 * These limiters guard abuse, they are not a security boundary — but they sit
 * in front of every chat, tool, upload and form route. When Upstash is
 * unreachable or over quota, `Ratelimit.limit()` throws, and before this
 * wrapper existed that throw turned into a 500 on every guarded route: the
 * whole product went down because the *limiter* was down (exactly what
 * happened when the free-tier 500k command quota ran out). Letting a request
 * through unmetered is strictly better than serving nobody.
 */

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface SafeLimiter {
  limit(key: string): Promise<LimitResult>;
}

let warnedAt = 0;

function failOpen(inner: Ratelimit): SafeLimiter {
  return {
    async limit(key: string): Promise<LimitResult> {
      try {
        return await inner.limit(key);
      } catch (err) {
        // Log at most once a minute — when the quota is gone, every request
        // lands here and per-request logging would flood the function logs.
        const now = Date.now();
        if (now - warnedAt > 60_000) {
          warnedAt = now;
          console.error(
            "Rate limiter unavailable — failing open:",
            err instanceof Error ? err.message : err
          );
        }
        return { success: true, limit: 0, remaining: 0, reset: 0 };
      }
    },
  };
}

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function makeLimiter(prefix: string, requests: number, window: "1 h"): SafeLimiter {
  return failOpen(
    new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix,
    })
  );
}

let _chatLimiter: SafeLimiter | null = null;
let _extractLimiter: SafeLimiter | null = null;
let _toolLimiter: SafeLimiter | null = null;
let _uploadLimiter: SafeLimiter | null = null;
let _formLimiter: SafeLimiter | null = null;

export function chatLimiter(): SafeLimiter {
  if (!_chatLimiter) _chatLimiter = makeLimiter("fh:chat", 20, "1 h");
  return _chatLimiter;
}

export function extractLimiter(): SafeLimiter {
  if (!_extractLimiter) _extractLimiter = makeLimiter("fh:extract", 100, "1 h");
  return _extractLimiter;
}

export function toolLimiter(): SafeLimiter {
  if (!_toolLimiter) _toolLimiter = makeLimiter("fh:tool", 10, "1 h");
  return _toolLimiter;
}

export function uploadLimiter(): SafeLimiter {
  if (!_uploadLimiter) _uploadLimiter = makeLimiter("fh:upload", 20, "1 h");
  return _uploadLimiter;
}

export function formLimiter(): SafeLimiter {
  if (!_formLimiter) _formLimiter = makeLimiter("fh:form", 5, "1 h");
  return _formLimiter;
}
