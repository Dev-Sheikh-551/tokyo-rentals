/**
 * Enquiry Delivery — Tokyo Rentals & Concierge
 *
 * Abstraction layer between the API route and the delivery mechanism.
 * The API route calls deliverEnquiry() — it does not care how the
 * enquiry is sent or stored.
 *
 * ── Current delivery modes ───────────────────────────────────────────────────
 *
 * EmailJS (production):
 *   Requires EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY,
 *   EMAILJS_PRIVATE_KEY and ENQUIRY_RECIPIENT_EMAIL in .env.local.
 *   Uses @emailjs/nodejs — no SMTP credentials required.
 *   Works with any EmailJS-connected service (Gmail, Outlook, etc.)
 *
 * Development fallback:
 *   When EmailJS is not configured, enquiry details are printed to the
 *   server console. The API still returns success — the site remains
 *   fully functional for development without any credentials.
 *
 * ── EmailJS setup guide ──────────────────────────────────────────────────────
 *   1. Create a free account at https://www.emailjs.com
 *   2. Add an email service (Gmail, Outlook, etc.)
 *   3. Create an email template with variables:
 *        {{from_name}}  {{from_email}}  {{phone}}  {{vehicle}}
 *        {{message}}    {{timestamp}}
 *   4. Copy your Service ID, Template ID, Public Key, and Private Key
 *   5. Add them to .env.local
 */

import emailjs from "@emailjs/nodejs";
import type { NormalizedEnquiry } from "./enquiry-validation";

export interface DeliveryResult {
  ok: boolean;
  error?: string;
}

// ── EmailJS configuration ─────────────────────────────────────────────────────

interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey: string;
  recipientEmail: string;
}

function getEmailJSConfig(): EmailJSConfig | null {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  const recipientEmail = process.env.ENQUIRY_RECIPIENT_EMAIL?.trim();

  if (!serviceId || !templateId || !publicKey || !privateKey || !recipientEmail) {
    return null;
  }

  return { serviceId, templateId, publicKey, privateKey, recipientEmail };
}

// ── Delivery ──────────────────────────────────────────────────────────────────

/**
 * Delivers an enquiry using EmailJS.
 *
 * When EmailJS is not configured (development), logs to console and returns ok.
 * When EmailJS fails, logs the error server-side and returns a generic failure.
 */
export async function deliverEnquiry(
  enquiry: NormalizedEnquiry
): Promise<DeliveryResult> {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const config = getEmailJSConfig();

  // ── Development fallback ─────────────────────────────────────────────────
  if (!config) {
    console.log("\n[ENQUIRY] ─────────────────────────────────────────────────");
    console.log("[ENQUIRY] New enquiry received (EmailJS not configured — dev mode)");
    console.log(`[ENQUIRY] Name:     ${enquiry.name}`);
    console.log(`[ENQUIRY] Email:    ${enquiry.email}`);
    if (enquiry.phone) console.log(`[ENQUIRY] Phone:    ${enquiry.phone}`);
    if (enquiry.vehicleName) console.log(`[ENQUIRY] Vehicle:  ${enquiry.vehicleName}`);
    console.log(`[ENQUIRY] Message:  ${enquiry.message.slice(0, 120)}${enquiry.message.length > 120 ? "…" : ""}`);
    console.log(`[ENQUIRY] Time:     ${timestamp}`);
    console.log("[ENQUIRY] ─────────────────────────────────────────────────\n");
    console.log("[ENQUIRY] To enable email delivery, add EmailJS credentials to .env.local");
    console.log("[ENQUIRY] See .env.example for required variables.\n");
    return { ok: true };
  }

  // ── EmailJS delivery ──────────────────────────────────────────────────────
  try {
    await emailjs.send(
      config.serviceId,
      config.templateId,
      {
        from_name: enquiry.name,
        from_email: enquiry.email,
        phone: enquiry.phone || "Not provided",
        vehicle: enquiry.vehicleName || "No preference",
        message: enquiry.message,
        timestamp,
        to_email: config.recipientEmail,
      },
      {
        publicKey: config.publicKey,
        privateKey: config.privateKey,
      }
    );

    console.log(`[ENQUIRY] Delivered via EmailJS to ${config.recipientEmail} at ${timestamp}`);
    return { ok: true };
  } catch (err) {
    // Log the real error server-side only — never expose to client
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ENQUIRY] EmailJS delivery failed:", msg);
    return { ok: false, error: "Delivery failed" };
  }
}
