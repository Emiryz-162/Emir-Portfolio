const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const submissions = new Map<string, RateLimitEntry>();

export function checkContactRateLimit(identifier: string) {
  const now = Date.now();
  const key = identifier || "anonymous";
  const existing = submissions.get(key);

  if (!existing || existing.resetAt <= now) {
    submissions.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true };
}
