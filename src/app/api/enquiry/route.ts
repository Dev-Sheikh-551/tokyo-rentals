/**
 * POST /api/enquiry
 *
 * Receives an enquiry submission from the form, validates it server-side,
 * applies rate limiting and spam protection, then forwards to the delivery
 * layer (SMTP or dev console).
 *
 * Only POST is accepted. All other methods return 405.
 *
 * Response contract:
 *   Success:  { ok: true }
 *   Failure:  { ok: false, error: string }
 *
 * Internal errors are logged server-side only — no stack traces or
 * implementation details are ever returned to the client.
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  validateServerEnquiry,
  LIMITS,
  type RawEnquiryPayload,
} from "@/lib/server/enquiry-validation";
import { checkRateLimit } from "@/lib/server/rate-limiter";
import { deliverEnquiry } from "@/lib/server/enquiry-delivery";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(): NextResponse {
  return NextResponse.json({ ok: true }, { status: 200 });
}

function fail(error: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}

function getClientIp(req: NextRequest): string {
  // Prefer standard forwarded header (set by most proxies / Vercel)
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Request size guard ───────────────────────────────────────────────
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > LIMITS.BODY_MAX_BYTES) {
    return fail("Request too large.", 413);
  }

  // ── 2. Rate limiting ────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    console.warn(`[ENQUIRY] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a few minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // ── 3. Parse body ───────────────────────────────────────────────────────
  let raw: RawEnquiryPayload;
  try {
    raw = (await req.json()) as RawEnquiryPayload;
  } catch {
    return fail("Invalid request body.", 400);
  }

  // ── 4. Server-side validation (incl. honeypot check) ───────────────────
  const validation = validateServerEnquiry(raw);

  if (!validation.ok) {
    // Honeypot triggered — return 200 to avoid revealing detection
    if ("_honeypot" in validation.errors) {
      console.warn(`[ENQUIRY] Honeypot triggered from IP: ${ip}`);
      return ok();
    }

    // Genuine validation error — return 400 with a generic message
    console.log(`[ENQUIRY] Validation failed from IP: ${ip}`, Object.keys(validation.errors));
    return fail("Please check your enquiry details.");
  }

  // ── 5. Timing check ─────────────────────────────────────────────────────
  // Submissions faster than 2000ms (2s) from form open are likely automated bots.
  const rawT = (raw as Record<string, unknown>)._t;
  if (typeof rawT === "number") {
    // If rawT is an elapsed duration (e.g. 500ms) or an epoch timestamp
    const elapsed = rawT > 1_000_000_000_000 ? Date.now() - rawT : rawT;
    if (elapsed > 0 && elapsed < 2000) {
      console.warn(`[ENQUIRY] Timing check failed (${elapsed}ms) from IP: ${ip}`);
      return ok(); // Silent rejection for bots
    }
  }

  // ── 6. Deliver ──────────────────────────────────────────────────────────
  console.log(`[ENQUIRY] Validated — delivering for: ${validation.normalized.email}`);

  const delivery = await deliverEnquiry(validation.normalized);

  if (!delivery.ok) {
    return fail("We couldn't process your enquiry right now. Please try again.", 500);
  }

  console.log(`[ENQUIRY] Success for: ${validation.normalized.email}`);
  return ok();
}

/** All non-POST methods return 405. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
