"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import EnquiryForm from "./EnquiryForm";
import {
  createWhatsAppUrl,
  createEmailUrl,
  createPhoneUrl,
  hasAnyContactMethod,
} from "@/lib/contact-links";
import { vehicles } from "@/data/vehicles";

interface EnquiryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Vehicle id to preselect in the form — passed from VehicleDetailOverlay handoff. */
  initialVehicleId?: string | null;
}

/**
 * EnquiryOverlay — Full-screen cinematic enquiry panel.
 *
 * Opens via a coordinated GSAP timeline:
 *   1. Backdrop fades in (0–0.5s)
 *   2. Panel slides up from below and fades in (0.3–0.9s)
 *   3. Header label resolves (0.6s)
 *   4. Headline stagger (0.7s)
 *   5. Form fields reveal sequentially (0.08s stagger)
 *   6. Direct contact strip fades last
 *
 * Close reverses the timeline.
 * ESC key closes the overlay.
 * Body scroll is locked while open (Lenis-safe: disables pointer events
 * on the Lenis scroll container rather than fighting body overflow).
 * Focus is trapped within the overlay while open.
 */
export default function EnquiryOverlay({
  isOpen,
  onClose,
  onSuccess,
  initialVehicleId,
}: EnquiryOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const contactStripRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // ── Open / Close animation ─────────────────────────────────────
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!overlayRef.current) return;

    if (isOpen) {
      // Record where focus was before opening
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Lock body scroll (Lenis-safe: disable pointer events on scroll layer)
      document.body.style.overflow = "hidden";

      // Kill any running tl
      tlRef.current?.kill();

      // Set initial states
      gsap.set(overlayRef.current, { display: "flex" });
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(panelRef.current, {
        opacity: 0,
        x: prefersReducedMotion ? 0 : 40,
      });
      gsap.set(labelRef.current, { opacity: 0, y: 10 });
      gsap.set(headlineRef.current, { opacity: 0, y: 16 });
      gsap.set(formWrapRef.current, { opacity: 0, y: 12 });
      if (contactStripRef.current) {
        gsap.set(contactStripRef.current, { opacity: 0 });
      }

      if (prefersReducedMotion) {
        gsap.set(
          [
            backdropRef.current,
            panelRef.current,
            labelRef.current,
            headlineRef.current,
            formWrapRef.current,
            contactStripRef.current,
          ].filter(Boolean),
          { opacity: 1, x: 0, y: 0 }
        );
        // Focus first input
        setTimeout(() => {
          const firstInput = overlayRef.current?.querySelector(
            "input, select, textarea"
          ) as HTMLElement | null;
          firstInput?.focus();
        }, 50);
        return;
      }

      // Build entrance timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });
      tlRef.current = tl;

      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
      })
        .to(panelRef.current, { opacity: 1, x: 0, duration: 0.55 }, 0.15)
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.35)
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.42)
        .to(formWrapRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.5);

      if (contactStripRef.current) {
        tl.to(contactStripRef.current, { opacity: 1, duration: 0.4 }, 0.65);
      }

      tl.add(() => {
        // Focus first input field once animation lands
        const firstInput = overlayRef.current?.querySelector(
          "input:not([type=hidden]):not([tabindex='-1']), select, textarea"
        ) as HTMLElement | null;
        firstInput?.focus();
      }, 0.5);
    } else {
      if (!overlayRef.current) return;

      if (prefersReducedMotion) {
        gsap.set(overlayRef.current, { display: "none" });
        document.body.style.overflow = "";
        previousFocusRef.current?.focus();
        return;
      }

      // Kill any running open timeline
      tlRef.current?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
          document.body.style.overflow = "";
          // Return focus to where user was
          previousFocusRef.current?.focus();
        },
      });
      tlRef.current = tl;

      const exitTargets = [
        contactStripRef.current,
        formWrapRef.current,
        headlineRef.current,
        labelRef.current,
      ].filter(Boolean);

      tl.to(exitTargets, {
        opacity: 0,
        y: -8,
        duration: 0.2,
        stagger: 0.03,
      })
        .to(panelRef.current, { opacity: 0, x: 30, duration: 0.3 }, 0.1)
        .to(
          backdropRef.current,
          { opacity: 0, duration: 0.3, ease: "power2.inOut" },
          0.15
        );
    }
  }, [isOpen]);

  // ── Keyboard: Escape closes ────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // ── Focus trap ─────────────────────────────────────────────────
  const handleFocusTrap = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab" || !overlayRef.current) return;

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  // Resolve vehicle context for direct contact channels if preselected
  const selectedVehicle = initialVehicleId
    ? vehicles.find((v) => v.id === initialVehicleId)
    : undefined;

  const whatsappLink = createWhatsAppUrl({ vehicle: selectedVehicle });
  const mailtoLink = createEmailUrl({ vehicle: selectedVehicle });
  const phoneLink = createPhoneUrl();
  const hasDirect = hasAnyContactMethod();

  return (
    /*
     * Hidden by default (display:none set via GSAP).
     * Uses display:flex when open.
     * Not conditionally rendered — avoids remounting/losing form state.
     */
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Enquiry"
      onKeyDown={(e) => {
        handleKeyDown(e);
        handleFocusTrap(e);
      }}
      style={{ display: "none" }}
      className="fixed inset-0 z-[200] flex items-stretch justify-end"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-obsidian-950/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — right side on desktop, full-screen on mobile */}
      <div
        ref={panelRef}
        data-lenis-prevent
        className="relative z-10 w-full sm:max-w-lg lg:max-w-xl xl:max-w-2xl
                   bg-obsidian-900 border-l border-white/[0.06]
                   flex flex-col overflow-y-auto overscroll-contain
                   px-6 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-16"
      >
        {/* ── Close button ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10 sm:mb-14 flex-shrink-0">
          <div ref={labelRef} className="flex items-center space-x-3">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-champagne/70 font-medium">
              The Enquiry
            </span>
            <span className="h-[1px] w-5 bg-champagne/30" />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close enquiry panel"
            className="group flex items-center space-x-2 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/60 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded-sm px-1 cursor-pointer"
          >
            <span>Close</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className="group-hover:rotate-90 transition-transform duration-300"
            >
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Editorial headline ──────────────────────────────── */}
        <div ref={headlineRef} className="mb-10 sm:mb-12 flex-shrink-0">
          <h2 className="font-serif-display font-light text-3xl sm:text-4xl lg:text-5xl text-warm-ivory leading-[1.08] tracking-tight">
            Let&apos;s begin
            <br />
            <em className="italic text-warm-linen">a conversation.</em>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-warm-sand/60 font-light leading-relaxed max-w-xs">
            Share a few details. We&apos;ll respond directly — no automated
            replies, no queues.
          </p>
        </div>

        {/* ── Form ────────────────────────────────────────────── */}
        <div ref={formWrapRef} className="flex-1">
          <EnquiryForm
            onSuccess={onSuccess}
            initialVehicleId={initialVehicleId}
          />
        </div>

        {/* ── Direct contact strip ─────────────────────────────── */}
        {hasDirect ? (
          <div
            ref={contactStripRef}
            className="mt-12 sm:mt-14 pt-6 border-t border-white/[0.06] flex-shrink-0"
          >
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-muted-grey/50 mb-4">
              Prefer to speak directly?
            </p>
            <div className="flex flex-col space-y-3">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-contact-method="whatsapp"
                  data-vehicle-id={selectedVehicle?.id}
                  aria-label={
                    selectedVehicle
                      ? `Contact Tokyo Rentals & Concierge about ${selectedVehicle.name} on WhatsApp`
                      : "Contact Tokyo Rentals & Concierge on WhatsApp"
                  }
                  className="group inline-flex items-center space-x-3 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                >
                  <span className="w-4 h-[1px] bg-white/20 group-hover:bg-champagne/60 transition-colors duration-200" />
                  <span>WhatsApp</span>
                  <span
                    aria-hidden="true"
                    className="text-champagne/60 group-hover:translate-x-0.5 transition-transform text-[11px]"
                  >
                    →
                  </span>
                </a>
              )}
              {mailtoLink && (
                <a
                  href={mailtoLink}
                  data-contact-method="email"
                  data-vehicle-id={selectedVehicle?.id}
                  aria-label={
                    selectedVehicle
                      ? `Email Tokyo Rentals & Concierge about ${selectedVehicle.name}`
                      : "Email Tokyo Rentals & Concierge"
                  }
                  className="group inline-flex items-center space-x-3 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                >
                  <span className="w-4 h-[1px] bg-white/20 group-hover:bg-champagne/60 transition-colors duration-200" />
                  <span>Email</span>
                  <span
                    aria-hidden="true"
                    className="text-champagne/60 group-hover:translate-x-0.5 transition-transform text-[11px]"
                  >
                    →
                  </span>
                </a>
              )}
              {phoneLink && (
                <a
                  href={phoneLink}
                  data-contact-method="phone"
                  data-vehicle-id={selectedVehicle?.id}
                  aria-label="Call Tokyo Rentals & Concierge"
                  className="group inline-flex items-center space-x-3 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                >
                  <span className="w-4 h-[1px] bg-white/20 group-hover:bg-champagne/60 transition-colors duration-200" />
                  <span>Phone</span>
                  <span
                    aria-hidden="true"
                    className="text-champagne/60 group-hover:translate-x-0.5 transition-transform text-[11px]"
                  >
                    →
                  </span>
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Hidden node preserves ref for GSAP target selector without layout footprint */
          <div ref={contactStripRef} className="hidden" />
        )}
      </div>
    </div>
  );
}
