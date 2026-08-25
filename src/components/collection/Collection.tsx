"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { vehicles } from "@/data/vehicles";
import CollectionHeader from "./CollectionHeader";
import VehicleSlide from "./VehicleSlide";

export default function Collection() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ==========================================
      // DESKTOP & TABLET: Pinned Horizontal Scroll
      // ==========================================
      mm.add("(min-width: 768px)", () => {
        const totalSlides = vehicles.length;

        // Master Pinned Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (totalSlides * 1.2)}`,
            scrub: 1.1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Horizontal Track Translation
        tl.to(trackRef.current, {
          xPercent: -100 * ((totalSlides - 1) / totalSlides),
          ease: "none",
        });

        if (prefersReducedMotion) return;

        // 2. Parallax Depth on Vehicle Images (Calibrated to stay safely within oversized canvas)
        const vehicleImages = gsap.utils.toArray<HTMLElement>(".vehicle-image");
        vehicleImages.forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: 8 },
            {
              xPercent: -8,
              ease: "none",
              scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: () => `+=${window.innerHeight * (totalSlides * 1.2)}`,
                scrub: 1.2,
              },
            }
          );
        });
      });

      // ==========================================
      // MOBILE: Clean Vertical Editorial Flow
      // ==========================================
      mm.add("(max-width: 767px)", () => {
        const slides = gsap.utils.toArray<HTMLElement>(".vehicle-slide");
        slides.forEach((slide) => {
          gsap.fromTo(
            slide,
            { opacity: prefersReducedMotion ? 1 : 0.7, y: prefersReducedMotion ? 0 : 30 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: slide,
                start: "top 85%",
                end: "top 45%",
                scrub: 0.8,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="collection"
      className="relative w-full bg-obsidian-950 text-warm-ivory overflow-hidden"
    >
      {/* Top Ambient Transition Divider */}
      <div className="w-full h-20 sm:h-24 bg-gradient-to-b from-transparent to-obsidian-950 pointer-events-none" />

      {/* Pinned Scroll Container */}
      <div ref={triggerRef} className="relative w-full min-h-[100svh] overflow-hidden">
        
        {/* Floating Section Title (Anchored at Top-Left, with Safe Visual Gap from Navbar & Slides) */}
        <div
          ref={headerWrapperRef}
          className="absolute top-6 sm:top-8 md:top-20 lg:top-24 left-6 sm:left-10 md:left-14 lg:left-20 z-30 pointer-events-none"
        >
          <CollectionHeader />
        </div>

        {/* Horizontal Sliding Vehicle Track */}
        <div
          ref={trackRef}
          className="flex flex-col md:flex-row w-full md:w-[300vw] h-full"
        >
          {vehicles.map((vehicle, index) => (
            <VehicleSlide
              key={vehicle.id}
              vehicle={vehicle}
              slideIndex={index}
            />
          ))}
        </div>

        {/* Bottom Ambient Lighting Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent pointer-events-none z-20" />
      </div>
    </section>
  );
}
