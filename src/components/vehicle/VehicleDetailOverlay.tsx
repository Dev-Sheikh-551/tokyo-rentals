"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Vehicle } from "@/types/vehicle";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import {
  createWhatsAppUrl,
  createEmailUrl,
  createPhoneUrl,
} from "@/lib/contact-links";
import VehicleSpecs from "./VehicleSpecs";

interface VehicleDetailOverlayProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

/**
 * VehicleDetailOverlay — Cinematic full-screen vehicle inspection experience.
 *
 * Layout (desktop):
 *   LEFT  62%: Large vehicle photography
 *   RIGHT 38%: Category / Name / Description / Specs / Enquiry CTA / Direct Contact / Close
 *
 * Layout (mobile):
 *   Full-screen stacked: image (top 45vh) → info (scrollable below)
 *
 * Animation sequence (open):
 *   1. Backdrop fades in          0 – 0.35s
 *   2. Panel resolves              0.2 – 0.7s
 *   3. Image scales 1.04 → 1.0    0.2 – 1.0s
 *   4. Category label enters       0.5s
 *   5. Headline enters             0.55s
 *   6. Description enters          0.65s
 *   7. Specs resolve               0.72s
 *   8. CTA appears last            0.80s
 *
 * Reduced motion: opacity-only transitions, no scale/translate.
 *
 * Scroll lock: body overflow hidden while open (same pattern as EnquiryOverlay).
 * Focus trap: keyboard navigation is contained within the overlay.
 * Escape: closes the overlay.
 */
export default function VehicleDetailOverlay({
  vehicle,
  onClose,
}: VehicleDetailOverlayProps) {
  const isOpen = vehicle !== null;

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { openEnquiry } = useEnquiry();

  // Contact links generated with vehicle context
  const whatsappLink = vehicle ? createWhatsAppUrl({ vehicle }) : null;
  const mailtoLink = vehicle ? createEmailUrl({ vehicle }) : null;
  const phoneLink = createPhoneUrl();
  const hasDirectContact = Boolean(whatsappLink || mailtoLink || phoneLink);

  // ── Open / Close animation ─────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Show overlay
      gsap.set(overlayRef.current, { display: "flex" });

      if (prefersReducedMotion) {
        gsap.set(
          [
            backdropRef.current,
            panelRef.current,
            labelRef.current,
            headlineRef.current,
            descRef.current,
            specsRef.current,
            ctaRef.current,
          ],
          { opacity: 1, y: 0, scale: 1 }
        );
        // Focus close button
        setTimeout(() => closeButtonRef.current?.focus(), 50);
        return;
      }

      // Set initial states
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(panelRef.current, { opacity: 0, y: 24 });
      gsap.set(imageRef.current, { scale: 1.04 });
      gsap.set(
        [
          labelRef.current,
          headlineRef.current,
          descRef.current,
          specsRef.current,
          ctaRef.current,
        ],
        { opacity: 0, y: 16 }
      );

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tlRef.current = tl;

      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.inOut",
      })
        .to(panelRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.2)
        .to(
          imageRef.current,
          { scale: 1.0, duration: 0.9, ease: "power2.out" },
          0.2
        )
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.5)
        .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.45 }, 0.55)
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.65)
        .to(specsRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.72)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.4 }, 0.8)
        .add(() => closeButtonRef.current?.focus(), 0.5);
    } else {
      if (!overlayRef.current) return;

      if (prefersReducedMotion) {
        gsap.set(overlayRef.current, { display: "none" });
        document.body.style.overflow = "";
        previousFocusRef.current?.focus();
        return;
      }

      // Kill any open timeline
      tlRef.current?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power2.in" },
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
          document.body.style.overflow = "";
          previousFocusRef.current?.focus();
        },
      });
      tlRef.current = tl;

      tl.to(
        [
          ctaRef.current,
          specsRef.current,
          descRef.current,
          headlineRef.current,
          labelRef.current,
        ],
        { opacity: 0, y: -10, duration: 0.2, stagger: 0.03 }
      )
        .to(panelRef.current, { opacity: 0, y: 16, duration: 0.3 }, 0.1)
        .to(
          backdropRef.current,
          { opacity: 0, duration: 0.3, ease: "power2.inOut" },
          0.15
        );
    }
  }, [isOpen]);

  // ── Escape key ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Focus trap ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !overlayRef.current) return;
      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
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
    };

    window.addEventListener("keydown", handleTabKey);
    return () => window.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // ── Enquiry handoff ────────────────────────────────────────────
  const handleEnquiry = useCallback(() => {
    onClose();
    // Small delay so the detail overlay begins closing before enquiry opens
    setTimeout(() => {
      if (vehicle) openEnquiry(vehicle.id);
    }, 250);
  }, [onClose, openEnquiry, vehicle]);

  // Always render the container (display:none when closed) to preserve GSAP refs
  return (
    <div
      ref={overlayRef}
      id="vehicle-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={
        vehicle ? `${vehicle.name} — Vehicle Details` : "Vehicle Details"
      }
      className="fixed inset-0 z-[150] hidden items-stretch justify-end"
      style={{ display: "none" }}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Main Panel ─────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="relative z-10 w-full flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Cinematic Image ─────────────────────────────── */}
        <div className="relative w-full lg:w-[62%] flex-shrink-0 overflow-hidden bg-obsidian-950 h-[45vh] lg:h-auto min-h-[260px]">
          {vehicle && (
            <>
              {/* Aspect-ratio wrapper — explicit height prevents Next/Image 0-height warning */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  ref={imageRef}
                  src={vehicle.image}
                  alt={`${vehicle.name} — Tokyo Rentals & Concierge`}
                  fill
                  priority
                  quality={92}
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="object-cover object-center will-change-transform transform-gpu"
                />
              </div>

              {/* Atmospheric overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian-950/30 pointer-events-none z-10 hidden lg:block" />

              {/* Bottom fade — blends into panel on mobile */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-obsidian-950 to-transparent pointer-events-none z-10 lg:hidden" />

              {/* Category watermark — bottom-left of image on desktop */}
              <div className="absolute bottom-6 left-6 sm:left-10 z-20 hidden lg:block pointer-events-none">
                <span className="text-[9px] uppercase tracking-[0.32em] text-warm-sand/40 font-medium">
                  {vehicle.category}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Information Column ─────────────────────────── */}
        <div
          className="
            relative flex-1 bg-obsidian-950 border-l border-white/[0.04]
            flex flex-col overflow-y-auto overscroll-contain
            px-6 sm:px-10 lg:px-12 xl:px-14
            pt-8 sm:pt-10 lg:pt-12 pb-10 sm:pb-12
            min-w-0 lg:max-w-[38%]
          "
          data-lenis-prevent
        >
          {/* Close button row */}
          <div className="flex items-center justify-between mb-8 sm:mb-10 flex-shrink-0">
            <div ref={labelRef} className="flex items-center space-x-3">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-champagne/70 font-medium">
                {vehicle?.category ?? ""}
              </span>
              {vehicle?.category && (
                <span className="h-[1px] w-4 sm:w-6 bg-champagne/30" />
              )}
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close vehicle detail"
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

          {/* Vehicle Name */}
          <div ref={headlineRef} className="flex-shrink-0 mb-5 sm:mb-6">
            <h2 className="font-serif-display font-light text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl text-warm-ivory leading-[1.06] tracking-tight">
              {vehicle?.name ?? ""}
            </h2>
          </div>

          {/* Description */}
          {vehicle?.description && (
            <p
              ref={descRef}
              className="text-xs sm:text-sm text-warm-sand/70 font-light leading-relaxed tracking-wide mb-7 sm:mb-8 flex-shrink-0 max-w-sm"
            >
              {vehicle.description}
            </p>
          )}

          {/* Specs */}
          {vehicle?.specs && (
            <div ref={specsRef} className="flex-shrink-0 mb-8 sm:mb-10">
              <VehicleSpecs specs={vehicle.specs} />
            </div>
          )}

          {/* Spacer pushes CTA toward bottom on tall panels */}
          <div className="flex-1" />

          {/* Drawn rule + CTA & Direct Contact */}
          <div
            ref={ctaRef}
            className="flex-shrink-0 pt-6 border-t border-white/[0.06]"
          >
            {/* Primary Action: Website Enquiry */}
            <button
              type="button"
              onClick={handleEnquiry}
              aria-label={`Start an enquiry about the ${vehicle?.name ?? "vehicle"}`}
              className="group flex items-center space-x-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/50 rounded-sm cursor-pointer"
            >
              <span className="font-serif-display font-light text-xl sm:text-2xl lg:text-3xl text-warm-ivory group-hover:text-champagne-light transition-colors duration-400 tracking-tight">
                Start an Enquiry
              </span>
              {/* Animated arrow */}
              <svg
                width="28"
                height="10"
                viewBox="0 0 28 10"
                fill="none"
                aria-hidden="true"
                className="text-champagne/50 group-hover:text-champagne group-hover:translate-x-1.5 transition-all duration-300 flex-shrink-0"
              >
                <path
                  d="M0 5H26M22 1L26 5L22 9"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="mt-3 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/40">
              No commitment. We respond personally.
            </p>

            {/* Secondary Actions: Direct Contact (Rendered only when channels are configured) */}
            {hasDirectContact && (
              <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-[9px] uppercase tracking-[0.28em] text-muted-grey/50 select-none">
                  Direct:
                </span>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-contact-method="whatsapp"
                    data-vehicle-id={vehicle?.id}
                    data-vehicle-name={vehicle?.name}
                    aria-label={`Contact Tokyo Rentals & Concierge about ${vehicle?.name ?? "this vehicle"} on WhatsApp`}
                    className="group inline-flex items-center space-x-1.5 text-[10px] sm:text-xs uppercase tracking-[0.24em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                  >
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
                    data-vehicle-id={vehicle?.id}
                    data-vehicle-name={vehicle?.name}
                    aria-label={`Email Tokyo Rentals & Concierge about ${vehicle?.name ?? "this vehicle"}`}
                    className="group inline-flex items-center space-x-1.5 text-[10px] sm:text-xs uppercase tracking-[0.24em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                  >
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
                    data-vehicle-id={vehicle?.id}
                    aria-label="Call Tokyo Rentals & Concierge"
                    className="group inline-flex items-center space-x-1.5 text-[10px] sm:text-xs uppercase tracking-[0.24em] text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm"
                  >
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
