import { createHash } from "node:crypto";

const MINUTE_WINDOW_MS = 60 * 1000;
const LONG_WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_MINUTE = 5;
const MAX_PER_LONG_WINDOW = 20;

type Bucket = {
  count: number;
  resetAt: number;
};

const minuteBuckets = new Map<string, Bucket>();
const longBuckets = new Map<string, Bucket>();

export type AssistantRateLimitResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

export function getAssistantRateLimitIdentifier(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const forwardedHost = headersList.get("x-forwarded-host");
  const source =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    forwardedHost ||
    "anonymous";

  return createHash("sha256")
    .update(`assistant:${source}`)
    .digest("hex")
    .slice(0, 32);
}

export function checkAssistantRateLimit(
  identifier: string,
): AssistantRateLimitResult {
  const now = Date.now();
  const minute = hitBucket(minuteBuckets, identifier, now, MINUTE_WINDOW_MS);
  const long = hitBucket(longBuckets, identifier, now, LONG_WINDOW_MS);

  cleanupBuckets(minuteBuckets, now);
  cleanupBuckets(longBuckets, now);

  if (minute.count > MAX_PER_MINUTE || long.count > MAX_PER_LONG_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((Math.min(minute.resetAt, long.resetAt) - now) / 1000),
      ),
    };
  }

  return { allowed: true };
}

function hitBucket(
  buckets: Map<string, Bucket>,
  key: string,
  now: number,
  windowMs: number,
) {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const next = {
      count: 1,
      resetAt: now + windowMs,
    };
    buckets.set(key, next);
    return next;
  }

  existing.count += 1;
  return existing;
}

function cleanupBuckets(buckets: Map<string, Bucket>, now: number) {
  for (const [key, value] of buckets) {
    if (value.resetAt <= now) buckets.delete(key);
  }
}
