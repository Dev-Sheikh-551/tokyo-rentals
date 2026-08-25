"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ExperienceStory — The secondary visual beat.
 *
 * A second, quieter cinematic composition that acts as a
 * film cut following ExperienceHero. A close-up detail
 * image enters with clip-path reveal + subtle parallax,
 * accompanied by a short editorial statement.
 *
 * Micro-interaction: the image container tracks pointer
 * position with very subtle magnetic tilt — reinforcing
 * the sense of physical depth without being distracting.
 */
export default function ExperienceStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const clipRevealRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Pointer-tilt micro-interaction state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const targetTilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // ── Clip-path reveal: image wipes in from left ──────────────
      gsap.fromTo(
        clipRevealRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: prefersReducedMotion ? 0 : 1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      // ── Text entrance ─────────────────────────────────────────────
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
        {
          opacity: 1,
          y: 0,
          duration: prefersReducedMotion ? 0 : 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none none",
          },
        }
      );

      // ── Horizontal rule draw ───────────────────────────────────────
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: prefersReducedMotion ? 0 : 1.4,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );

      if (prefersReducedMotion) return;

      // ── Image subtle parallax on scroll ───────────────────────────
      gsap.to(imageRef.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    // ── Pointer tilt micro-interaction ─────────────────────────────
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer || prefersReducedMotion) return () => ctx.revert();

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
    let isRunning = false;

    const onPointerMove = (e: PointerEvent) => {
      if (!imageWrapperRef.current) return;
      const rect = imageWrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetTilt.current = {
        x: ((e.clientY - cy) / (rect.height / 2)) * -3.5,
        y: ((e.clientX - cx) / (rect.width / 2)) * 3.5,
      };

      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    const onPointerLeave = () => {
      targetTilt.current = { x: 0, y: 0 };
    };

    const loop = () => {
      setTilt((prev) => {
        const nx = lerp(prev.x, targetTilt.current.x, 0.07);
        const ny = lerp(prev.y, targetTilt.current.y, 0.07);

        const isSettled =
          Math.abs(nx - targetTilt.current.x) < 0.005 &&
          Math.abs(ny - targetTilt.current.y) < 0.005;

        if (isSettled && targetTilt.current.x === 0 && targetTilt.current.y === 0) {
          isRunning = false;
          return { x: 0, y: 0 };
        }

        if (isRunning) {
          rafRef.current = requestAnimationFrame(loop);
        }

        return { x: nx, y: ny };
      });
    };

    const el = imageWrapperRef.current;
    el?.addEventListener("pointermove", onPointerMove);
    el?.addEventListener("pointerleave", onPointerLeave);

    return () => {
      ctx.revert();
      el?.removeEventListener("pointermove", onPointerMove);
      el?.removeEventListener("pointerleave", onPointerLeave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience-story"
      aria-label="The Experience — Story"
      className="relative w-full bg-obsidian-950 overflow-hidden"
    >
      {/* Top ambient bleed */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-obsidian-950 to-transparent pointer-events-none z-10" />

      <div className="max-w-[1720px] w-full mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-20 sm:py-28 md:py-36 lg:py-44">

        {/* ── Editorial composition grid ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">

          {/* Left column — image */}
          <div className="lg:col-span-7 order-1">
            {/* Clip-path reveal wrapper */}
            <div ref={clipRevealRef} style={{ clipPath: "inset(0 100% 0 0)" }}>
              {/* Perspective tilt wrapper */}
              <div
                ref={imageWrapperRef}
                className="relative w-full aspect-[3/2] overflow-hidden rounded-sm bg-obsidian-900 cursor-none"
                style={{
                  perspective: "1200px",
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: "transform 0.05s linear",
                  willChange: "transform",
                }}
              >
                <Image
                  ref={imageRef}
                  src="/images/experience-detail.jpg"
                  alt="Automotive detail — wheel and road surface, editorial photography"
                  fill
                  quality={85}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center will-change-transform transform-gpu scale-[1.08]"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-obsidian-950/30 via-transparent to-obsidian-950/40 pointer-events-none" />
                <div className="absolute inset-0 border border-white/[0.06] rounded-sm pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right column — editorial text */}
          <div
            ref={textRef}
            className="lg:col-span-5 order-2 flex flex-col justify-end pb-0 lg:pb-6 opacity-0"
          >
            {/* Drawn horizontal rule */}
            <div
              ref={lineRef}
              className="w-full h-[1px] bg-white/10 mb-8 sm:mb-10 origin-left scale-x-0"
            />

            {/* Editorial statement */}
            <h3 className="font-serif-display font-light text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] text-warm-ivory leading-[1.15] tracking-tight">
              Every departure
              <br />
              <em className="italic text-warm-linen">
                is a composition.
              </em>
            </h3>

            {/* Supporting text */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-warm-sand/65 font-light leading-relaxed tracking-wide max-w-xs sm:max-w-sm">
              From the weight of the door closing to the texture of the road
              disappearing behind you — the details accumulate into something
              that feels, simply, right.
            </p>
          </div>

        </div>
      </div>

      {/* Bottom ambient bleed */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-obsidian-950 to-transparent pointer-events-none z-10" />
    </section>
  );
}
