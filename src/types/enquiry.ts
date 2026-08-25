/**
 * Enquiry Types — Tokyo Rentals & Concierge
 *
 * Core type definitions for the enquiry form.
 * Deliberately minimal — this is an expression of interest,
 * not a booking form.
 */

export interface EnquiryData {
  name: string;
  email: string;
  phone?: string;
  vehicle?: string;
  message: string;
}

export interface EnquiryValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  vehicle?: string;
  message?: string;
}

export type EnquiryStatus = "idle" | "submitting" | "success" | "error";

/**
 * Validates enquiry form data.
 * Returns an error map; empty object means valid.
 */
export function validateEnquiry(data: EnquiryData): EnquiryValidationErrors {
  const errors: EnquiryValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "Your name is required.";
  }

  if (!data.email.trim()) {
    errors.email = "Your email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.message.trim()) {
    errors.message = "Please share a few details about what you need.";
  } else if (data.message.trim().length < 10) {
    errors.message = "A little more detail would help us respond well.";
  }

  return errors;
}

export function hasErrors(errors: EnquiryValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
