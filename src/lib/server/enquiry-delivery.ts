/**
 * Enquiry Delivery — Tokyo Rentals & Concierge
 *
 * Abstraction layer between the API route and the delivery mechanism.
 * The API route calls deliverEnquiry() — it does not care how the
 * enquiry is sent or stored.
 *
 * ── Current delivery modes ───────────────────────────────────────────────────
 *
 * SMTP (production):
 *   Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
 *   and ENQUIRY_RECIPIENT_EMAIL to be set in .env.local.
 *   Uses nodemailer. Compatible with any standard SMTP provider:
 *   Gmail (App Password), Outlook, Zoho, custom hosting SMTP, etc.
 *
 * Development fallback:
 *   When SMTP is not configured, enquiry details are printed to the
 *   server console. The API still returns success — the site remains
 *   fully functional for development without any email credentials.
 *
 * ── To add a new delivery method ────────────────────────────────────────────
 *   Implement the logic inside deliverEnquiry() and return DeliveryResult.
 *   The API route and form UI never need to change.
 */

import nodemailer from "nodemailer";
import type { NormalizedEnquiry } from "./enquiry-validation";

export interface DeliveryResult {
  ok: boolean;
  error?: string;
}

// ── Environment configuration ─────────────────────────────────────────────────

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  recipient: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const recipient = process.env.ENQUIRY_RECIPIENT_EMAIL?.trim();

  if (!host || !user || !password || !from || !recipient) {
    return null;
  }

  const port = portStr ? parseInt(portStr, 10) : 587;
  const secure = process.env.SMTP_SECURE?.trim().toLowerCase() === "true";

  return { host, port, secure, user, password, from, recipient };
}

// ── Email content builder ─────────────────────────────────────────────────────

function buildEmailText(enquiry: NormalizedEnquiry, timestamp: string): string {
  const lines: string[] = [
    "TOKYO RENTALS & CONCIERGE",
    "─".repeat(40),
    "",
    "NEW ENQUIRY",
    "",
    `Name:              ${enquiry.name}`,
    `Email:             ${enquiry.email}`,
  ];

  if (enquiry.phone) {
    lines.push(`WhatsApp / Phone:  ${enquiry.phone}`);
  }

  if (enquiry.vehicleName) {
    lines.push(`Vehicle Interest:  ${enquiry.vehicleName}`);
  }

  lines.push(
    "",
    "Message:",
    "─".repeat(40),
    enquiry.message,
    "─".repeat(40),
    "",
    `Submitted: ${timestamp}`,
  );

  return lines.join("\n");
}

function buildEmailHtml(enquiry: NormalizedEnquiry, timestamp: string): string {
  const hr = '<hr style="border:none;border-top:1px solid #2a2a2a;margin:20px 0;">';
  const rows: string[] = [
    row("Name", enquiry.name),
    row("Email", `<a href="mailto:${enquiry.email}" style="color:#c4a676;">${enquiry.email}</a>`),
  ];

  if (enquiry.phone) rows.push(row("WhatsApp / Phone", enquiry.phone));
  if (enquiry.vehicleName) rows.push(row("Vehicle Interest", enquiry.vehicleName));

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060608;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#c9c3b4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060608;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0a0a0d;border:1px solid #1c1c24;border-radius:4px;overflow:hidden;">
        <tr><td style="padding:32px 40px 24px;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#827e75;">Tokyo Rentals &amp; Concierge</p>
          <h1 style="margin:0;font-size:22px;font-weight:300;color:#f7f4ed;letter-spacing:-0.01em;">New Enquiry</h1>
        </td></tr>
        <tr><td style="padding:0 40px;">
          ${hr}
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows.join("")}
          </table>
          ${hr}
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#827e75;">Message</p>
          <p style="margin:0;font-size:14px;font-weight:300;line-height:1.7;color:#e8e3d5;white-space:pre-wrap;">${escHtml(enquiry.message)}</p>
          ${hr}
          <p style="margin:0;font-size:10px;color:#3e3c38;">Submitted: ${timestamp}</p>
        </td></tr>
        <tr><td style="padding:24px 40px;">
          <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#3e3c38;">
            Reply directly to <a href="mailto:${enquiry.email}" style="color:#827e75;">${enquiry.email}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#827e75;width:150px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;font-weight:300;color:#f7f4ed;">${value}</td>
  </tr>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Delivery ──────────────────────────────────────────────────────────────────

/**
 * Delivers an enquiry using the configured delivery method.
 *
 * When SMTP is not configured (development), logs to console and returns ok.
 * When SMTP is configured but fails, logs the error server-side and returns
 * a generic failure — no internal details are exposed to the client.
 */
export async function deliverEnquiry(
  enquiry: NormalizedEnquiry
): Promise<DeliveryResult> {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const smtpConfig = getSmtpConfig();

  // ── Development fallback ─────────────────────────────────────────────────
  if (!smtpConfig) {
    console.log("\n[ENQUIRY] ─────────────────────────────────────────────────");
    console.log("[ENQUIRY] New enquiry received (no SMTP configured — dev mode)");
    console.log(`[ENQUIRY] Name:     ${enquiry.name}`);
    console.log(`[ENQUIRY] Email:    ${enquiry.email}`);
    if (enquiry.phone) console.log(`[ENQUIRY] Phone:    ${enquiry.phone}`);
    if (enquiry.vehicleName) console.log(`[ENQUIRY] Vehicle:  ${enquiry.vehicleName}`);
    console.log(`[ENQUIRY] Message:  ${enquiry.message.slice(0, 120)}${enquiry.message.length > 120 ? "…" : ""}`);
    console.log(`[ENQUIRY] Time:     ${timestamp}`);
    console.log("[ENQUIRY] ─────────────────────────────────────────────────\n");
    console.log("[ENQUIRY] To enable email delivery, configure SMTP variables in .env.local");
    console.log("[ENQUIRY] See .env.local.example for required variables.\n");
    return { ok: true };
  }

  // ── SMTP delivery ─────────────────────────────────────────────────────────
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: smtpConfig.recipient,
      replyTo: enquiry.email,
      subject: `New Enquiry — ${enquiry.name} | Tokyo Rentals & Concierge`,
      text: buildEmailText(enquiry, timestamp),
      html: buildEmailHtml(enquiry, timestamp),
    });

    console.log(`[ENQUIRY] Delivered via SMTP to ${smtpConfig.recipient} at ${timestamp}`);
    return { ok: true };
  } catch (err) {
    // Log the real error server-side only — never expose to client
    console.error("[ENQUIRY] SMTP delivery failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Delivery failed" };
  }
}
