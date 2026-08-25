"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ExperienceHero — The primary cinematic image act.
 *
 * Three depth planes move independently on scroll:
 *   • Background image: slowest movement, subtle scale
 *   • Midground overlay: moderate opacity shift
 *   • Foreground typography: slight counter-drift
 *
 * Fully reversible via fromTo + ScrollTrigger.
 */
export default function ExperienceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const midgroundRef = useRef<HTMLDivElement>(null);
  const fgTextRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const entryHeadlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // ── Entrance: section fades into view with refined contrast ──────────────
      const entryTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 30%",
          scrub: 0.9,
        },
      });

      entryTl
        .fromTo(
          sectionRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power2.out" }
        )
        .fromTo(
          labelRef.current,
          { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .fromTo(
          entryHeadlineRef.current,
          { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.7"
        )
        .fromTo(
          bodyRef.current,
          { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );

      if (prefersReducedMotion) return;

      // ── Camera Push: image scales forward as user scrolls (Reversible) ──────────
      // Background plane — slowest
      gsap.fromTo(
        bgLayerRef.current,
        { yPercent: 0 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Image — moderate push with scale
      gsap.fromTo(
        imageRef.current,
        { scale: 1.0, yPercent: 0 },
        {
          scale: 1.08,
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Midground overlay — gentle darkening shift
      gsap.fromTo(
        midgroundRef.current,
        { opacity: 0 },
        {
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "70% top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Foreground text — counter-drift (moves slightly upward and dissolves)
      gsap.fromTo(
        fgTextRef.current,
        { yPercent: 0, opacity: 1, filter: "blur(0px)" },
        {
          yPercent: -20,
          opacity: 0,
          filter: "blur(3px)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "55% top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-label="The Experience"
      className="relative w-full h-[100svh] min-h-[640px] overflow-hidden bg-obsidian-950 opacity-0"
    >
      {/* ── Background depth plane ─────────────────────────────────── */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 w-full h-[115%] -top-[7.5%] will-change-transform"
      >
        {/* Primary cinematic image */}
        <div className="relative w-full h-full">
          <Image
            ref={imageRef}
            src="/images/experience-primary.jpg"
            alt="A vehicle moves along a coastal road at dusk — atmospheric editorial"
            fill
            quality={92}
            sizes="100vw"
            className="object-cover object-center will-change-transform transform-gpu"
          />
        </div>
      </div>

      {/* ── Atmosphere overlays (Refined for Natural Luminosity) ─────── */}
      <div className="absolute inset-0 bg-cinematic-fade pointer-events-none z-10" />
      <div className="absolute inset-0 bg-vignette-radial pointer-events-none z-10" />
      <div
        ref={midgroundRef}
        className="absolute inset-0 bg-obsidian-950/25 pointer-events-none z-10 opacity-0"
      />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-obsidian-950 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian-950 to-transparent pointer-events-none z-20" />

      {/* ── Foreground typography (depth plane 3) ─────────────────── */}
      <div
        ref={fgTextRef}
        className="absolute inset-0 z-30 flex flex-col justify-end pointer-events-none"
      >
        <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pb-16 sm:pb-20 md:pb-24 lg:pb-28">

          {/* Section Label */}
          <div ref={labelRef} className="flex items-center space-x-3 mb-4 sm:mb-5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-champagne/80 font-medium">
              The Experience
            </span>
            <span className="h-[1px] w-5 sm:w-8 bg-champagne/35" />
          </div>

          {/* Editorial Headline */}
          <div ref={entryHeadlineRef}>
            <h2 className="font-serif-display font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-warm-ivory leading-[1.0] tracking-tight">
              The journey
              <br />
              <em className="italic font-normal text-warm-linen">
                matters too.
              </em>
            </h2>
          </div>

          {/* Editorial Body */}
          <p
            ref={bodyRef}
            className="mt-5 sm:mt-6 text-xs sm:text-sm md:text-base text-warm-sand/75 font-light leading-relaxed tracking-wide max-w-xs sm:max-w-sm md:max-w-md"
          >
            The right vehicle changes the character of every mile.
            Movement, considered.
          </p>

        </div>
      </div>
    </section>
  );
}
