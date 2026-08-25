"use client";

import Image from "next/image";
import { Vehicle } from "@/types/vehicle";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { useVehicleDetail } from "@/components/vehicle/VehicleDetailContext";
import { ArrowUpRight } from "lucide-react";

interface VehicleSlideProps {
  vehicle: Vehicle;
  isActive?: boolean;
  slideIndex: number;
}

export default function VehicleSlide({
  vehicle,
  slideIndex,
}: VehicleSlideProps) {
  const { openEnquiry } = useEnquiry();
  const { openDetail } = useVehicleDetail();

  const specsList = vehicle.specs
    ? [
        vehicle.specs.seats,
        vehicle.specs.transmission,
        vehicle.specs.airConditioning,
        vehicle.specs.drivetrain,
        vehicle.specs.fuel,
      ].filter(Boolean)
    : [];

  return (
    <div
      className="vehicle-slide relative w-full md:w-screen h-[100svh] min-h-[640px] flex-shrink-0 flex items-center justify-center overflow-hidden px-6 sm:px-10 md:px-14 lg:px-20 select-none"
      data-index={slideIndex}
    >
      {/* Layer 1: Ambient Background Depth */}
      <div className="absolute inset-0 bg-radial-gradient from-obsidian-900/30 via-obsidian-950 to-obsidian-950 pointer-events-none -z-10" />

      {/* Main Editorial Composition Grid */}
      <div className="max-w-[1720px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 pt-28 sm:pt-32 md:pt-36 lg:pt-28 pb-8">

        {/* Left Column: Typography & Metadata */}
        <div className="vehicle-meta lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          {/* Category */}
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-champagne font-medium">
              {vehicle.category}
            </span>
          </div>

          {/* Vehicle Name */}
          <h3 className="vehicle-title font-serif-display font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-ivory leading-[1.08] tracking-tight">
            {vehicle.name}
          </h3>

          {/* Tagline */}
          {vehicle.tagline && (
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-warm-sand/90 font-light leading-relaxed max-w-md">
              {vehicle.tagline}
            </p>
          )}

          {/* Spec tags */}
          {specsList.length > 0 && (
            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
              {specsList.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-full border border-white/10 bg-obsidian-900/60 text-muted-grey font-mono"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="mt-6 sm:mt-8 pt-4 border-t border-white/[0.06] flex items-center gap-6 max-w-md">
            {/* PRIMARY: View vehicle — opens detail overlay */}
            <button
              type="button"
              onClick={() => openDetail(vehicle.id)}
              aria-label={`View ${vehicle.name} details`}
              className="group flex items-center space-x-2 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-warm-ivory hover:text-champagne-light transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/60 rounded-sm"
            >
              <span>View vehicle</span>
              <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* SECONDARY: Direct enquiry */}
            <button
              type="button"
              onClick={() => openEnquiry(vehicle.id)}
              aria-label={`Enquire about ${vehicle.name}`}
              className="group text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-muted-grey/70 hover:text-warm-sand transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 rounded-sm"
            >
              Enquire
            </button>
          </div>
        </div>

        {/* Right Column: Vehicle Photography */}
        <div className="vehicle-visual-wrapper lg:col-span-7 flex justify-center items-center order-1 lg:order-2">
          {/* Image frame — also clickable to open detail */}
          <button
            type="button"
            onClick={() => openDetail(vehicle.id)}
            aria-label={`View ${vehicle.name} details`}
            className="
              relative w-full aspect-[16/10] sm:aspect-[16/9]
              min-h-[260px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[440px]
              max-h-[60vh] rounded-lg overflow-hidden
              border border-white/[0.08] bg-obsidian-900
              group shadow-2xl cursor-pointer
              focus:outline-none focus-visible:ring-1 focus-visible:ring-champagne/40
            "
          >
            {/* Oversized canvas for zero-bleed parallax */}
            <div className="absolute -top-[6%] -bottom-[6%] -left-[12%] -right-[12%] w-[124%] h-[112%]">
              <Image
                src={vehicle.image}
                alt={`${vehicle.name} - Tokyo Rentals & Concierge collection vehicle`}
                fill
                priority={slideIndex < 2}
                loading="eager"
                quality={92}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="vehicle-image object-cover object-center will-change-transform transform-gpu"
              />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/20 via-transparent to-transparent pointer-events-none" />

            {/* Hover reveal — "View" label fades in on the image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10">
              <div className="flex items-center space-x-2 bg-obsidian-950/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/10">
                <span className="text-[10px] uppercase tracking-[0.28em] text-warm-ivory font-medium">
                  View
                </span>
                <ArrowUpRight className="w-3 h-3 text-champagne" />
              </div>
            </div>

            {/* Sheen border */}
            <div className="absolute inset-0 border border-white/10 group-hover:border-champagne/30 rounded-lg pointer-events-none transition-colors duration-500" />
          </button>
        </div>

      </div>
    </div>
  );
}
