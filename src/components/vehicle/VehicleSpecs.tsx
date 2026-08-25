"use client";

import { VehicleSpecs as VehicleSpecsType } from "@/types/vehicle";

interface VehicleSpecsProps {
  specs: VehicleSpecsType;
}

type SpecEntry = { label: string; value: string };

function normalizeAirCon(v: boolean | string): string {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v;
}

/**
 * VehicleSpecs — Quiet editorial specification list.
 *
 * Only renders entries with defined values.
 * Layout: 2-column grid on desktop, 2-column on mobile.
 * Each entry has a small-caps label and a larger value.
 * Thin dividers separate rows.
 */
export default function VehicleSpecs({ specs }: VehicleSpecsProps) {
  const entries: SpecEntry[] = [
    specs.seats != null
      ? { label: "Seats", value: String(specs.seats) }
      : null,
    specs.transmission
      ? { label: "Transmission", value: specs.transmission }
      : null,
    specs.fuel
      ? { label: "Fuel", value: specs.fuel }
      : null,
    specs.airConditioning != null
      ? { label: "Air Conditioning", value: normalizeAirCon(specs.airConditioning) }
      : null,
    specs.drivetrain
      ? { label: "Drivetrain", value: specs.drivetrain }
      : null,
    specs.luggage != null
      ? { label: "Luggage", value: String(specs.luggage) }
      : null,
  ].filter((e): e is SpecEntry => e !== null);

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-0">
      {entries.map((entry, i) => (
        <div
          key={entry.label}
          className={`py-4 border-t border-white/[0.06] ${
            // Right-column entries get a slightly faded divider to avoid double borders
            i % 2 === 1 ? "border-white/[0.03]" : ""
          }`}
        >
          <dt className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-muted-grey/60 font-medium mb-1.5 select-none">
            {entry.label}
          </dt>
          <dd className="text-sm sm:text-base text-warm-ivory font-light leading-tight">
            {entry.value}
          </dd>
        </div>
      ))}
    </div>
  );
}
