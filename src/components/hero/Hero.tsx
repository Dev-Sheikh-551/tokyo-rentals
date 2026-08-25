"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const overlayGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // 1. Initial State Setup
      gsap.set(curtainRef.current, { opacity: 1 });
      gsap.set(imageRef.current, {
        scale: prefersReducedMotion ? 1.0 : 1.1,
        filter: "brightness(0.75) contrast(1.05)",
      });
      gsap.set(headlineRef.current, { opacity: 0, y: prefersReducedMotion ? 0 : 25 });
      gsap.set(scrollIndicatorRef.current, { opacity: 0 });

      // 2. Cinematic Entrance Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.25,
      });

      tl.to(curtainRef.current, {
        opacity: 0,
        duration: prefersReducedMotion ? 0.01 : 1.5,
        ease: "power2.inOut",
      })
        .to(
          imageRef.current,
          {
            scale: 1.0,
            filter: "brightness(0.98) contrast(1.02)",
            duration: prefersReducedMotion ? 0.01 : 2.2,
            ease: "power2.out",
          },
          "-=1.2"
        )
        .to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0.01 : 1.4,
            ease: "power3.out",
          },
          "-=1.2"
        )
        .to(
          scrollIndicatorRef.current,
          {
            opacity: 1,
            duration: prefersReducedMotion ? 0.01 : 1.0,
            ease: "power2.out",
          },
          "-=0.7"
        );

      if (prefersReducedMotion) return;

      // 3. Reversible Cinematic Scroll Parallax Choreography
      if (containerRef.current && imageRef.current) {
        // Image Parallax (scale and subtle camera push)
        gsap.fromTo(
          imageRef.current,
          {
            yPercent: 0,
            scale: 1.0,
            filter: "brightness(0.98) contrast(1.02)",
          },
          {
            yPercent: 16,
            scale: 1.1,
            filter: "brightness(0.8) contrast(1.06)",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        // Headline Editorial Drift & Dissolve (fully reversible on scroll back to top)
        if (headlineRef.current) {
          gsap.fromTo(
            headlineRef.current,
            {
              yPercent: 0,
              opacity: 1,
              filter: "blur(0px)",
            },
            {
              yPercent: -40,
              opacity: 0,
              filter: "blur(3px)",
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "65% top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // Scroll indicator fade out on scroll
        if (scrollIndicatorRef.current) {
          gsap.fromTo(
            scrollIndicatorRef.current,
            {
              opacity: 1,
            },
            {
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "35% top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight * 0.95,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[640px] flex flex-col justify-between overflow-hidden bg-obsidian-950 select-none"
    >
      {/* 1. Deep Black Entrance Curtain */}
      <div
        ref={curtainRef}
        className="absolute inset-0 z-40 bg-obsidian-950 pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Main Cinematic Visual Layer with Parallax */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 w-full h-full overflow-hidden z-0"
      >
        <div className="relative w-full h-[120%] -top-[10%] left-0">
          <Image
            ref={imageRef}
            src="/images/hero-cinematic.jpg"
            alt="Tokyo Rentals & Concierge flagship visual presentation"
            fill
            priority
            quality={92}
            className="object-cover object-center will-change-transform transform-gpu"
            sizes="100vw"
          />
        </div>

        {/* Cinematic Lighting & Atmosphere Overlays */}
        <div className="absolute inset-0 bg-cinematic-fade pointer-events-none z-10" />
        <div className="absolute inset-0 bg-vignette-radial pointer-events-none z-10" />
        <div
          ref={overlayGlowRef}
          className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-transparent pointer-events-none z-10"
        />
      </div>

      {/* 3. Top Spacer for Fixed Nav Offset */}
      <div className="relative z-20 pt-28 sm:pt-32" />

      {/* 4. Center-Right Editorial Hierarchy */}
      <div
        ref={headlineRef}
        className="relative z-20 max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex flex-col justify-center my-auto pointer-events-none"
      >
        <div className="max-w-3xl">
          {/* Large Editorial Statement */}
          <h1 className="font-serif-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-ivory leading-[1.12] tracking-tight">
            An uncompromising standard <br className="hidden sm:inline" />
            <span className="italic font-normal text-warm-linen">
              of automotive distinction.
            </span>
          </h1>

          {/* Minimal Editorial Annotation */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-warm-sand/80 max-w-lg font-light leading-relaxed tracking-wide">
            A considered selection of premium vehicles and discreet mobility in The Gambia.
          </p>
        </div>
      </div>

      {/* 5. Bottom Scroll Indicator */}
      <div className="relative z-20 max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pb-8 sm:pb-10 md:pb-12 flex justify-center">
        <button
          type="button"
          ref={scrollIndicatorRef}
          onClick={scrollToNext}
          aria-label="Scroll to explore collection"
          className="cursor-pointer group flex flex-col items-center space-y-2 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/60 rounded-sm cursor-target"
        >
          <span className="text-[9px] sm:text-[10px] uppercase tracking-super-wide text-muted-grey group-hover:text-warm-ivory transition-colors duration-300">
            Scroll to Explore
          </span>
          <span className="relative block w-4 h-7 rounded-full border border-white/15 group-hover:border-champagne/50 flex items-start justify-center p-1 transition-colors duration-300">
            <span className="w-1 h-1.5 rounded-full bg-champagne animate-bounce" />
          </span>
        </button>
      </div>
    </section>
  );
}
