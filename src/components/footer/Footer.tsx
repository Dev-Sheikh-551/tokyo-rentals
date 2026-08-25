"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import {
  createWhatsAppUrl,
  createEmailUrl,
  createPhoneUrl,
} from "@/lib/contact-links";

/**
 * Footer — The Closing Frame.
 *
 * A quiet, cinematic closing composition that acts as the final frame
 * of the editorial narrative. Occupies generous negative space, restrained
 * typography, and delicate motion.
 */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement>(null);

  const { openEnquiry } = useEnquiry();

  // ── Scroll to anchor helper ──────────────────────────────────────
  const scrollToSection = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── GSAP Motion Design ──────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Horizontal rule draw
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: prefersReducedMotion ? 0 : 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Elements reveal with subtle stagger
      const targets = [
        brandRef.current,
        statementRef.current,
        indexRef.current,
        bottomRowRef.current,
      ].filter(Boolean);

      if (!prefersReducedMotion) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      } else {
        gsap.set(targets, { opacity: 1, y: 0 });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const whatsappLink = createWhatsAppUrl();
  const mailtoLink = createEmailUrl();
  const phoneLink = createPhoneUrl();

  return (
    <footer
      ref={footerRef}
      id="closing-frame"
      aria-label="Closing Frame"
      className="relative w-full bg-obsidian-950 text-warm-sand min-h-[60vh] flex flex-col justify-between overflow-hidden"
    >
      {/* ── Top Atmospheric Fade from Enquiry ───────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-28 sm:h-36 bg-gradient-to-b from-obsidian-950 to-transparent pointer-events-none z-10" />

      {/* ── Main Footer Composition ───────────────────────────────── */}
      <div className="relative z-20 max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pt-20 sm:pt-28 pb-12 flex-1 flex flex-col justify-between">
        <div>
          {/* Drawn Rule */}
          <div
            ref={lineRef}
            className="w-full h-[1px] bg-white/[0.08] mb-16 sm:mb-20 origin-left"
          />

          {/* Editorial Grid: Brand + Statement + Index */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Brand Lockup */}
            <div
              ref={brandRef}
              className="lg:col-span-5 flex flex-col space-y-4"
            >
              <div className="flex flex-col select-none">
                <span className="font-serif-display font-light text-3xl sm:text-4xl md:text-5xl tracking-[0.24em] text-warm-ivory">
                  TOKYO
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-script-brand text-sm sm:text-base md:text-lg text-champagne/90 tracking-wide">
                    Rentals &amp; Concierge
                  </span>
                  <span className="inline-block w-1 h-1 rounded-full bg-champagne/40" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/80">
                    The Gambia
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-warm-sand/60 font-light leading-relaxed tracking-wide max-w-sm pt-2">
                Discreet executive fleet and private travel across The Gambia.
                Movement, carefully considered.
              </p>
            </div>

            {/* Middle Column: Closing Statement */}
            <div
              ref={statementRef}
              className="lg:col-span-4 flex flex-col justify-start"
            >
              <h3 className="font-serif-display font-light text-2xl sm:text-3xl md:text-4xl text-warm-ivory leading-[1.12] tracking-tight">
                Until the next
                <br />
                <em className="italic text-warm-linen">journey.</em>
              </h3>
              <p className="mt-4 text-xs sm:text-sm text-warm-sand/50 font-light leading-relaxed max-w-xs">
                For reservations, tailored itineraries, or direct private bookings.
              </p>
            </div>

            {/* Right Column: Navigation Index & Action */}
            <div
              ref={indexRef}
              className="lg:col-span-3 grid grid-cols-2 gap-8 sm:gap-12"
            >
              {/* Editorial Index */}
              <nav
                aria-label="Editorial Index"
                className="flex flex-col space-y-3"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-muted-grey/50 font-medium mb-1 select-none">
                  Index
                </span>
                <a
                  href="#collection"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#collection");
                  }}
                  className="group inline-flex items-center space-x-2 text-xs sm:text-sm text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 cursor-pointer cursor-target"
                >
                  <span>Collection</span>
                </a>
                <a
                  href="#experience"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#experience");
                  }}
                  className="group inline-flex items-center space-x-2 text-xs sm:text-sm text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 cursor-pointer cursor-target"
                >
                  <span>Experience</span>
                </a>
                <a
                  href="#enquiry"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#enquiry");
                  }}
                  className="group inline-flex items-center space-x-2 text-xs sm:text-sm text-warm-sand/70 hover:text-warm-ivory transition-colors duration-200 cursor-pointer cursor-target"
                >
                  <span>Enquiry</span>
                </a>
              </nav>

              {/* Action Column */}
              <div className="flex flex-col space-y-3">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-muted-grey/50 font-medium mb-1 select-none">
                  Access
                </span>
                <button
                  type="button"
                  onClick={() => openEnquiry()}
                  className="group inline-flex items-center space-x-2 text-xs sm:text-sm text-warm-ivory hover:text-champagne-light transition-colors duration-200 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm cursor-target"
                >
                  <span>Enquire</span>
                  <span
                    aria-hidden="true"
                    className="text-champagne/70 group-hover:translate-x-1 transition-transform duration-300 text-xs"
                  >
                    →
                  </span>
                </button>

                {/* Conditional direct contact links if configured */}
                {(whatsappLink || mailtoLink || phoneLink) && (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-white/[0.04]">
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-contact-method="whatsapp"
                        aria-label="Contact Tokyo Rentals & Concierge on WhatsApp"
                        className="text-[10px] sm:text-xs text-warm-sand/60 hover:text-warm-ivory transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm cursor-target"
                      >
                        WhatsApp
                      </a>
                    )}
                    {mailtoLink && (
                      <a
                        href={mailtoLink}
                        data-contact-method="email"
                        aria-label="Email Tokyo Rentals & Concierge"
                        className="text-[10px] sm:text-xs text-warm-sand/60 hover:text-warm-ivory transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm cursor-target"
                      >
                        Email
                      </a>
                    )}
                    {phoneLink && (
                      <a
                        href={phoneLink}
                        data-contact-method="phone"
                        aria-label="Call Tokyo Rentals & Concierge"
                        className="text-[10px] sm:text-xs text-warm-sand/60 hover:text-warm-ivory transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm cursor-target"
                      >
                        Phone
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Legal & Back to Top ───────────────────────── */}
        <div
          ref={bottomRowRef}
          className="pt-16 sm:pt-24 mt-16 sm:mt-24 border-t border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          {/* Copyright line */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/50">
            <span>&copy; 2026 Tokyo Rentals &amp; Concierge</span>
            <span className="hidden sm:inline text-dark-grey">&bull;</span>
            <span>The Gambia &middot; West Africa</span>
          </div>

          {/* Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top of page"
            className="group inline-flex items-center space-x-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-muted-grey/60 hover:text-warm-ivory transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40 rounded-sm cursor-target"
          >
            <span>Back to top</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
              className="text-champagne/60 group-hover:-translate-y-0.5 transition-transform duration-300"
            >
              <path
                d="M5 9V1M1 5L5 1L9 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom breathing space */}
      <div className="h-6 sm:h-10 bg-obsidian-950 pointer-events-none" />
    </footer>
  );
}
