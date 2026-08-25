"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEnquiry } from "./EnquiryContext";

/**
 * EnquirySection — The conversion moment of the page narrative.
 *
 * A large editorial composition that emerges from darkness
 * at the end of the Experience chapter. Minimal content —
 * a headline, a short line of copy, and a single restrained
 * primary action.
 */
export default function EnquirySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const { isOpen, isComplete, openEnquiry } = useEnquiry();

  // ── Entrance animation ──────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "top 20%",
          scrub: 0.7,
        },
      });

      tl.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out" }
      );

      if (!prefersReducedMotion) {
        // Stagger children once in view
        gsap.fromTo(
          [labelRef.current, headlineRef.current, subtextRef.current, lineRef.current, ctaRef.current],
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              toggleActions: "play none none none",
            },
          }
        );
      } else {
        gsap.set(
          [labelRef.current, headlineRef.current, subtextRef.current, lineRef.current, ctaRef.current],
          { opacity: 1, y: 0 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Handle success animation when isComplete updates ─────────────
  useEffect(() => {
    if (isComplete && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }, [isComplete]);

  return (
    <section
      ref={sectionRef}
      id="enquiry"
      aria-label="Start an enquiry"
      className="relative w-full bg-obsidian-950 overflow-hidden opacity-0"
    >
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b from-obsidian-950 to-transparent pointer-events-none z-10" />

      <div className="relative z-20 max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-28 sm:pb-36 md:pb-44 lg:pb-56">

        {/* ── Two-column editorial grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">

          {/* Left — Section label + headline */}
          <div className="lg:col-span-7">
            {/* Section label */}
            <div ref={labelRef} className="flex items-center space-x-3 mb-6 sm:mb-8">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-champagne/70 font-medium">
                The Enquiry
              </span>
              <span className="h-[1px] w-5 sm:w-8 bg-champagne/30" />
            </div>

            {/* Primary editorial headline */}
            <div ref={headlineRef}>
              <h2 className="font-serif-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-warm-ivory leading-[0.98] tracking-tight">
                When you&apos;re
                <br />
                <em className="italic text-warm-linen">
                  ready.
                </em>
              </h2>
            </div>

            {/* Supporting copy */}
            <p
              ref={subtextRef}
              className="mt-6 sm:mt-7 text-xs sm:text-sm md:text-base text-warm-sand/65 font-light leading-relaxed tracking-wide max-w-sm"
            >
              A conversation — not a form. Tell us what you need,
              and we&apos;ll respond personally.
            </p>
          </div>

          {/* Right — CTA + direct contact */}
          <div className="lg:col-span-5 flex flex-col lg:pt-20">

            {/* Drawn rule */}
            <div
              ref={lineRef}
              className="w-full h-[1px] bg-white/[0.08] mb-8 sm:mb-10 origin-left"
            />

            {/* Success state */}
            {isComplete ? (
              <div ref={successRef} className="opacity-0">
                <div className="flex items-center space-x-3 mb-5">
                  <span className="h-[1px] w-5 bg-champagne/50" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-champagne/70">
                    Received
                  </span>
                </div>
                <h3 className="font-serif-display font-light text-2xl sm:text-3xl text-warm-ivory leading-tight tracking-tight mb-3">
                  Thank you.
                </h3>
                <p className="text-xs sm:text-sm text-warm-sand/60 font-light leading-relaxed">
                  We&apos;ll be in touch directly.
                </p>
              </div>
            ) : (
              <div ref={ctaRef}>
                {/* Primary action */}
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => openEnquiry()}
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-controls="enquiry-overlay"
                  className="group flex items-start flex-col space-y-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/50 rounded-sm w-full sm:w-auto cursor-pointer"
                >
                  <span className="relative flex items-baseline space-x-4 group">
                    <span className="font-serif-display font-light text-2xl sm:text-3xl md:text-4xl text-warm-ivory group-hover:text-champagne-light transition-colors duration-500 tracking-tight">
                      Start an Enquiry
                    </span>
                    {/* Arrow */}
                    <svg
                      width="32"
                      height="12"
                      viewBox="0 0 32 12"
                      fill="none"
                      aria-hidden="true"
                      className="text-champagne/50 group-hover:text-champagne group-hover:translate-x-1.5 transition-all duration-400 self-center flex-shrink-0"
                    >
                      <path
                        d="M0 6H30M25 1L30 6L25 11"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {/* Animated underline */}
                  <span
                    aria-hidden="true"
                    className="block h-[1px] w-0 group-hover:w-full bg-warm-ivory/15 transition-all duration-500 ease-out"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bleed to darkness */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-obsidian-950 to-transparent pointer-events-none z-10" />
    </section>
  );
}
