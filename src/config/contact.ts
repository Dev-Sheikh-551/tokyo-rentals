/**
 * Contact Configuration — Tokyo Rentals & Concierge
 *
 * Central source of truth for verified business contact channels.
 *
 * Reads from environment variables (e.g. .env.local) with safe fallbacks.
 */

export interface ContactConfig {
  /** Public WhatsApp number in international format. Set to null until verified. */
  whatsapp: string | null;
  /** Primary public contact / reservation email address. Set to null until verified. */
  email: string | null;
  /** Public telephone number for direct voice calls. Set to null until verified. */
  phone: string | null;
  /** Verified business legal / trade name */
  businessName: string;
  /** Verified country of operation */
  country: string;
}

export const contactConfig: ContactConfig = {
  // Public WhatsApp number in international format (+220 for The Gambia)
  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "+2205938108",

  // Public concierge email
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "sheikhtijantouray551@gmail.com",

  // Public telephone line
  phone:
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "+220 593 8108",

  // Verified business trade name
  businessName: "Tokyo Rentals & Concierge",

  // Verified country of operation
  country: "The Gambia",
};
