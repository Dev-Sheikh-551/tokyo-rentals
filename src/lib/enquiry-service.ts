/**
 * Enquiry Service — Tokyo Rentals & Concierge
 *
 * Client-side abstraction between the form UI and the API route.
 *
 * The form calls submitEnquiry() — it has no knowledge of the endpoint,
 * HTTP method, or any server-side implementation details.
 *
 * If the API route changes, only this file needs updating.
 */

import type { EnquiryData } from "@/types/enquiry";

export interface SubmissionResult {
  ok: boolean;
  error?: string;
}

// Shape of the payload sent to the API.
// Extends EnquiryData with anti-spam fields that are added here,
// not in the form component — keeping the form clean.
interface ApiPayload extends EnquiryData {
  /** Honeypot — left empty by real users, populated by bots. */
  website?: string;
  /** Form-open timestamp — used for timing-based bot detection. */
  _t?: number;
}

/**
 * Submits an enquiry to the server-side API route.
 *
 * Adds anti-spam fields (honeypot, timestamp) transparently.
 * The form UI never needs to know these exist.
 *
 * Returns { ok: true } on success.
 * Returns { ok: false, error: string } on any failure (network, validation,
 * server error) — the caller decides how to display the error.
 */
export async function submitEnquiry(
  data: EnquiryData,
  /** Optional: timestamp when the form was opened, for timing check. */
  formOpenedAt?: number
): Promise<SubmissionResult> {
  const elapsedMs =
    formOpenedAt && formOpenedAt > 0 ? Date.now() - formOpenedAt : 5000;

  const payload: ApiPayload = {
    ...data,
    website: "", // Honeypot — must remain empty
    _t: elapsedMs, // Elapsed milliseconds on client
  };

  try {
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Parse the response body regardless of status
    let body: SubmissionResult;
    try {
      body = (await response.json()) as SubmissionResult;
    } catch {
      return {
        ok: false,
        error: "We couldn't process your enquiry right now. Please try again.",
      };
    }

    if (!response.ok || !body.ok) {
      return {
        ok: false,
        error:
          body.error ??
          "We couldn't process your enquiry right now. Please try again.",
      };
    }

    return { ok: true };
  } catch {
    // Network failure (offline, DNS, timeout, etc.)
    return {
      ok: false,
      error:
        "A network error occurred. Please check your connection and try again.",
    };
  }
}
