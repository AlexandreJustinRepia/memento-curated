/**
 * In-memory sliding-window rate limiter.
 *
 * Works per-IP using a Map of timestamp arrays.
 * Safe for a single Next.js server process.
 * For multi-instance / edge deployments, replace the store with Redis.
 */

type RateLimitStore = Map<string, number[]>;

// Module-level store — persists across requests within the same process.
const store: RateLimitStore = new Map();

export interface RateLimitOptions {
  /** Unique name for this limiter (e.g. "signin", "signup") */
  id: string;
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining allowed requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the oldest entry in the window expires */
  resetAt: number;
}

/**
 * Check whether the given IP is within its rate limit.
 * Call this at the top of a route handler before doing any real work.
 */
export function rateLimit(ip: string, opts: RateLimitOptions): RateLimitResult {
  const key = `${opts.id}:${ip}`;
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  // Retrieve existing timestamps and prune those outside the window
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  const remaining = Math.max(0, opts.limit - timestamps.length);
  const resetAt = timestamps.length > 0 ? timestamps[0] + opts.windowMs : now + opts.windowMs;

  if (timestamps.length >= opts.limit) {
    store.set(key, timestamps);
    return { success: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { success: true, remaining: remaining - 1, resetAt };
}

/**
 * Extract the best available client IP from a Next.js request.
 * Falls back to "unknown" when running behind a proxy without forwarded headers.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
