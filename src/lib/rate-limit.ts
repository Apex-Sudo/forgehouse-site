import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

let _chatLimiter: Ratelimit | null = null;
let _extractLimiter: Ratelimit | null = null;

export function chatLimiter() {
  if (!_chatLimiter) {
    _chatLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "fh:chat",
    });
  }
  return _chatLimiter;
}

export function extractLimiter() {
  if (!_extractLimiter) {
    _extractLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(30, "1 h"),
      prefix: "fh:extract",
    });
  }
  return _extractLimiter;
}
