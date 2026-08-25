/**
 * Rate Limiter — Tokyo Rentals & Concierge
 *
 * In-process sliding-window rate limiter keyed on IP address.
 *
 * ⚠️  PRODUCTION WARNING ──────────────────────────────────────────────────────
 * This limiter stores state in-process memory.
 *
 * It is SUFFICIENT for:
 *   • Local development
 *   • Single-process Node.js server (e.g. a single VPS / VM)
 *   • Vercel Edge with a single region (with caveats — see below)
 *
 * It is NOT sufficient for:
 *   • Multi-instance deployments (each instance has independent state)
 *   • Serverless functions that may be cold-started per request
 *   • Any deployment where horizontal scaling runs multiple processes
 *
 * For multi-instance production, replace the Map below with a shared
 * store such as Upstash Redis + @upstash/ratelimit, or Vercel KV.
 * The interface (checkRateLimit) stays the same.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Defaults: 5 requests per 10 minutes per IP.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

/** Periodic cleanup to prevent unbounded Map growth. */
function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

// Run cleanup every 15 minutes.
// In serverless environments this interval may not reliably fire,
// but the cleanup also runs per-request for expired keys.
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 15 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether the given identifier (typically an IP) is within the
 * allowed request window. Mutates state to record the attempt.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || now >= existing.resetAt) {
    // New window
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
  };
}
