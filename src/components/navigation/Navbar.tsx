"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToCollection = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header
      ref={navRef}
      id="main-nav"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out opacity-100 translate-y-0",
        scrolled
          ? "bg-obsidian-950/85 backdrop-blur-md border-b border-white/5 py-4 sm:py-5"
          : "bg-transparent py-6 sm:py-8 md:py-10",
        className
      )}
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex items-center justify-between">
        {/* Brand Wordmark (Left) */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Tokyo Rentals & Concierge - Back to top"
          className="flex flex-col group cursor-pointer select-none text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/60 rounded-sm"
        >
          <span className="flex items-baseline space-x-2">
            <span className="font-serif-display font-light text-xl sm:text-2xl md:text-3xl tracking-[0.24em] text-warm-ivory transition-colors duration-300 group-hover:text-champagne-light">
              TOKYO
            </span>
          </span>
          <span className="flex items-center space-x-2 -mt-0.5 sm:-mt-1">
            <span className="font-script-brand text-xs sm:text-sm md:text-base text-champagne/90 tracking-wide">
              Rentals &amp; Concierge
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-champagne/40" />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-muted-grey/80 hidden sm:inline-block">
              The Gambia
            </span>
          </span>
        </button>

        {/* Minimal Navigation Trigger (Right) */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <a
            href="#collection"
            onClick={scrollToCollection}
            aria-label="Explore Collection"
            className="group relative flex items-center space-x-3 px-4 sm:px-5 py-2 rounded-full border border-white/10 hover:border-champagne/40 bg-obsidian-900/40 hover:bg-obsidian-800/60 backdrop-blur-md transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/60"
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-warm-sand group-hover:text-warm-ivory transition-colors duration-300">
              Fleet
            </span>
            <span className="flex flex-col space-y-1 w-4 sm:w-4.5 justify-center items-end">
              <span className="w-full h-[1px] bg-warm-sand group-hover:bg-champagne transition-all duration-300 group-hover:w-full" />
              <span className="w-2.5 h-[1px] bg-warm-sand/80 group-hover:bg-champagne transition-all duration-300 group-hover:w-full" />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
