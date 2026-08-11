import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

/**
 * A fixed-window limit on report generation, counted per IP in Redis.
 *
 * Generation is the expensive thing this app does — five model requests per
 * submission — so the limit sits on `/api/analyze` and nowhere else. Reading a
 * report back costs a single Redis GET and is not worth policing.
 */

const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

const key = (ip: string) => `ratelimit:${ip}`;

/**
 * The caller's IP, as far as it can be known.
 *
 * On Vercel every request arrives through the proxy, so the client address is
 * the first entry of `x-forwarded-for` — the rest of the list is the proxy
 * chain, and only the leftmost hop is the one we mean. Locally the header is
 * absent, which is why everything shares one bucket in dev.
 */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  /** How many requests this IP has made in the current window. */
  count: number;
  /** Seconds until the window resets, for the Retry-After header. */
  retryAfter: number;
}

/**
 * Counts one request and says whether it may proceed.
 *
 * INCR creates the counter at 1 on the first request of a window, which is the
 * only moment the expiry needs setting — resetting it on every request would
 * turn a fixed window into one that never ends for anyone who keeps trying.
 *
 * If that EXPIRE were ever lost (a process killed between the two calls), the
 * counter would outlive its window and lock the IP out permanently, so a
 * request that finds itself over the limit checks for a missing TTL and
 * repairs it. That costs an extra round trip only on requests already being
 * refused.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const db = redis();
  const count = await db.incr(key(ip));

  if (count === 1) {
    await db.expire(key(ip), WINDOW_SECONDS);
    return { allowed: true, count, retryAfter: WINDOW_SECONDS };
  }

  if (count <= LIMIT) {
    return { allowed: true, count, retryAfter: WINDOW_SECONDS };
  }

  const ttl = await db.ttl(key(ip));
  if (ttl < 0) {
    // No expiry: repair it rather than leave this IP blocked forever.
    await db.expire(key(ip), WINDOW_SECONDS);
    return { allowed: false, count, retryAfter: WINDOW_SECONDS };
  }

  return { allowed: false, count, retryAfter: ttl };
}
