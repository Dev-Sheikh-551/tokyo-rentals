import { contactConfig } from "@/config/contact";
import { Vehicle } from "@/types/vehicle";

export interface WhatsAppOptions {
  vehicle?: Vehicle | { name: string };
  message?: string;
}

export interface EmailOptions {
  vehicle?: Vehicle | { name: string };
  subject?: string;
  body?: string;
}

/**
 * Normalizes a phone number to digits only for WhatsApp wa.me links.
 */
function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Normalizes a phone number for tel: links (preserves leading + and digits).
 */
function cleanTelNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}

/**
 * Generates an official WhatsApp URL with contextual enquiry messaging.
 * Returns null if no WhatsApp number is configured.
 */
export function createWhatsAppUrl(options?: WhatsAppOptions): string | null {
  if (!contactConfig.whatsapp) return null;

  const cleanPhone = cleanWhatsAppNumber(contactConfig.whatsapp);
  if (!cleanPhone) return null;

  let text = options?.message;
  if (!text) {
    if (options?.vehicle?.name) {
      text = `Hello, I’m interested in the ${options.vehicle.name}. I’d like to enquire about it.`;
    } else {
      text = "Hello, I’d like to make an enquiry about Tokyo Rentals & Concierge.";
    }
  }

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Generates a mailto: URL with contextual subject and body.
 * Returns null if no email is configured.
 */
export function createEmailUrl(options?: EmailOptions): string | null {
  if (!contactConfig.email) return null;

  let subject = options?.subject;
  let body = options?.body;

  if (!subject) {
    if (options?.vehicle?.name) {
      subject = `Vehicle enquiry — ${options.vehicle.name}`;
    } else {
      subject = "Tokyo Rentals & Concierge enquiry";
    }
  }

  if (body === undefined && options?.vehicle?.name) {
    body = `Hello, I’m interested in the ${options.vehicle.name}.\n\nI’d like to make an enquiry.`;
  }

  const params: string[] = [];
  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  const queryString = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${contactConfig.email}${queryString}`;
}

/**
 * Generates a tel: URI for direct voice calling.
 * Returns null if no phone number is configured.
 */
export function createPhoneUrl(): string | null {
  if (!contactConfig.phone) return null;
  const cleanPhone = cleanTelNumber(contactConfig.phone);
  if (!cleanPhone) return null;
  return `tel:${cleanPhone}`;
}

/**
 * Utility to check if any direct contact channel is active.
 */
export function hasAnyContactMethod(): boolean {
  return Boolean(
    contactConfig.whatsapp || contactConfig.email || contactConfig.phone
  );
}
