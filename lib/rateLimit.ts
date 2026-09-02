/**
 * File-based sliding-window rate limiter.
 *
 * Stores timestamps in a JSON file under /tmp so it survives warm restarts
 * within the same deployment but is cleared on fresh deployments.
 */

import fs from "fs";
import os from "os";
import path from "path";

const DATA_PATH = path.join(os.tmpdir(), "memento-rate-limit-store.json");

interface RateLimitOptions {
  id: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

function loadStore(): Record<string, number[]> {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw) as Record<string, number[]>;
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, number[]>) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(store));
  } catch {
    // Ignore write errors
  }
}

export function rateLimit(ip: string, opts: RateLimitOptions): RateLimitResult {
  const key = `${opts.id}:${ip}`;
  const now = Date.now();
  const windowStart = now - opts.windowMs;

  const store = loadStore();
  const timestamps = (store[key] ?? []).filter((t) => t > windowStart);

  const remaining = Math.max(0, opts.limit - timestamps.length);
  const resetAt = timestamps.length > 0 ? timestamps[0] + opts.windowMs : now + opts.windowMs;

  if (timestamps.length >= opts.limit) {
    saveStore(store);
    return { success: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  store[key] = timestamps;
  saveStore(store);
  return { success: true, remaining: remaining - 1, resetAt };
}

export function resetRateLimitStore() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      fs.unlinkSync(DATA_PATH);
    }
  } catch {
    // Ignore errors
  }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
