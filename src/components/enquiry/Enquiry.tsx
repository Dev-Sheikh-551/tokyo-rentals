"use client";

import EnquirySection from "./EnquirySection";

/**
 * Enquiry — Phase 04 orchestrator.
 *
 * Thin wrapper that exports the enquiry chapter.
 * EnquirySection manages the scrolled-into presentation
 * and owns the overlay open/close state internally.
 */
export default function Enquiry() {
  return <EnquirySection />;
}
