/**
 * Server-side Enquiry Validation — Tokyo Rentals & Concierge
 *
 * Independent of client-side validation. The browser cannot be trusted.
 * This module runs only on the server (API route).
 *
 * Exports constants shared between validation and the API route,
 * and a server-side validate function that returns typed errors.
 */

import { vehicles } from "@/data/vehicles";

// ── Limits ────────────────────────────────────────────────────────────────────

export const LIMITS = {
  NAME_MAX: 100,
  EMAIL_MAX: 254, // RFC 5321 maximum
  PHONE_MAX: 30,
  VEHICLE_ID_MAX: 60,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2000,
  /** Maximum raw request body size in bytes (16 KB) */
  BODY_MAX_BYTES: 16 * 1024,
} as const;

// ── Known vehicle IDs ─────────────────────────────────────────────────────────

/** Set of valid vehicle IDs sourced from the server-side dataset. */
const VALID_VEHICLE_IDS: ReadonlySet<string> = new Set(
  vehicles.map((v) => v.id)
);

export function isValidVehicleId(id: string): boolean {
  return VALID_VEHICLE_IDS.has(id);
}

export function resolveVehicleName(id: string): string | undefined {
  return vehicles.find((v) => v.id === id)?.name;
}

// ── Email regex ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Validation result ─────────────────────────────────────────────────────────

export interface ServerValidationResult {
  ok: true;
  normalized: NormalizedEnquiry;
}

export interface ServerValidationFailure {
  ok: false;
  errors: Record<string, string>;
}

export type ServerValidation = ServerValidationResult | ServerValidationFailure;

export interface NormalizedEnquiry {
  name: string;
  email: string;
  phone?: string;
  vehicleId?: string;
  vehicleName?: string;
  message: string;
}

// ── Raw payload type ──────────────────────────────────────────────────────────
// We accept unknown from JSON.parse and narrow it here.

export interface RawEnquiryPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  vehicle?: unknown;
  message?: unknown;
  /** Honeypot field — must be empty */
  website?: unknown;
}

// ── Validate ──────────────────────────────────────────────────────────────────

export function validateServerEnquiry(
  raw: RawEnquiryPayload
): ServerValidation {
  const errors: Record<string, string> = {};

  // ── Honeypot ─────────────────────────────────────────────────────────────
  // If populated, silently reject without revealing the reason.
  if (typeof raw.website === "string" && raw.website.length > 0) {
    return {
      ok: false,
      errors: { _honeypot: "rejected" },
    };
  }

  // ── Name ─────────────────────────────────────────────────────────────────
  const rawName = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!rawName) {
    errors.name = "Your name is required.";
  } else if (rawName.length > LIMITS.NAME_MAX) {
    errors.name = `Name must be ${LIMITS.NAME_MAX} characters or fewer.`;
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  const rawEmail =
    typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!rawEmail) {
    errors.email = "Your email address is required.";
  } else if (rawEmail.length > LIMITS.EMAIL_MAX) {
    errors.email = "Please enter a valid email address.";
  } else if (!EMAIL_RE.test(rawEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  // ── Phone (optional) ─────────────────────────────────────────────────────
  const rawPhone =
    typeof raw.phone === "string" ? raw.phone.trim() : undefined;
  if (rawPhone && rawPhone.length > LIMITS.PHONE_MAX) {
    errors.phone = "Phone number appears too long.";
  }

  // ── Vehicle (optional) ───────────────────────────────────────────────────
  const rawVehicle =
    typeof raw.vehicle === "string" ? raw.vehicle.trim() : undefined;
  let vehicleId: string | undefined;
  let vehicleName: string | undefined;

  if (rawVehicle) {
    if (rawVehicle.length > LIMITS.VEHICLE_ID_MAX) {
      errors.vehicle = "Invalid vehicle selection.";
    } else if (!isValidVehicleId(rawVehicle)) {
      errors.vehicle = "Please select a valid vehicle.";
    } else {
      vehicleId = rawVehicle;
      vehicleName = resolveVehicleName(rawVehicle);
    }
  }

  // ── Message ──────────────────────────────────────────────────────────────
  const rawMessage =
    typeof raw.message === "string" ? raw.message.trim() : "";
  if (!rawMessage) {
    errors.message = "Please share a few details about what you need.";
  } else if (rawMessage.length < LIMITS.MESSAGE_MIN) {
    errors.message = "A little more detail would help us respond well.";
  } else if (rawMessage.length > LIMITS.MESSAGE_MAX) {
    errors.message = `Message must be ${LIMITS.MESSAGE_MAX} characters or fewer.`;
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    normalized: {
      name: rawName,
      email: rawEmail,
      phone: rawPhone || undefined,
      vehicleId,
      vehicleName,
      message: rawMessage,
    },
  };
}
