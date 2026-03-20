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
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      prefix: "fh:extract",
    });
  }
  return _extractLimiter;
}

let _toolLimiter: Ratelimit | null = null;
let _uploadLimiter: Ratelimit | null = null;
let _formLimiter: Ratelimit | null = null;

export function toolLimiter() {
  if (!_toolLimiter) {
    _toolLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "fh:tool",
    });
  }
  return _toolLimiter;
}

export function uploadLimiter() {
  if (!_uploadLimiter) {
    _uploadLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "fh:upload",
    });
  }
  return _uploadLimiter;
}

export function formLimiter() {
  if (!_formLimiter) {
    _formLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "fh:form",
    });
  }
  return _formLimiter;
}
