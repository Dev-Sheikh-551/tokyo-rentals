/**
 * Contact Configuration — Tokyo Rentals & Concierge
 *
 * Central source of truth for verified business contact channels.
 *
 * =========================================================================
 * ADMINISTRATION INSTRUCTIONS:
 * =========================================================================
 * 1. WhatsApp: Enter the official business number in international format
 *    without spaces or symbols, e.g. "+2207123456" or "2207123456".
 *    Keep null until verified with the business owner.
 *
 * 2. Email: Enter the primary concierge/reservation email address,
 *    e.g. "concierge@tokyorentals.gm".
 *    Keep null until verified.
 *
 * 3. Phone: Enter the primary direct telephone number in display format,
 *    e.g. "+220 712 3456".
 *    Keep null until verified.
 *
 * When any value is null, the corresponding UI actions will be cleanly
 * hidden without breaking layout or leaving empty space.
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
  // Public WhatsApp number in international format.
  // Set to null until verified.
  whatsapp: null,

  // Public concierge email.
  // Set to null until verified.
  email: null,

  // Public telephone line.
  // Set to null until verified.
  phone: null,

  // Verified business trade name
  businessName: "Tokyo Rentals & Concierge",

  // Verified country of operation
  country: "The Gambia",
};
