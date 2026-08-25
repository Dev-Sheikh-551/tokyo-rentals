import { Vehicle } from "@/types/vehicle";

/**
 * The Collection — Central Vehicle Dataset
 * 
 * NOTE: These vehicle entries are configured as visual development placeholders
 * (marked with isDemoAsset: true) pending confirmed fleet inventory from Tokyo Rentals.
 * All specification fields are optional and render conditionally.
 */
export const vehicles: Vehicle[] = [
  {
    id: "executive-suv",
    index: "01",
    name: "Executive Full-Size SUV",
    category: "Prestige Fleet",
    tagline: "Unrivaled presence and elevated touring comfort.",
    description:
      "A commanding flagship SUV combining spacious interior craftsmanship with composed grand-touring capability across urban Banjul and coastal routes.",
    image: "/images/collection-01.jpg",
    specs: {
      seats: "5 Seats",
      transmission: "Automatic",
      airConditioning: "Climate Control",
      drivetrain: "All-Wheel Drive",
    },
    isDemoAsset: true,
  },
  {
    id: "luxury-sedan",
    index: "02",
    name: "Executive Saloon",
    category: "Chauffeured & Self-Drive",
    tagline: "Quiet sophistication and seamless poise.",
    description:
      "Refined executive comfort engineered for discrete personal transit, airport transfers, and private engagements.",
    image: "/images/collection-02.jpg",
    specs: {
      seats: "5 Seats",
      transmission: "Automatic",
      airConditioning: "Dual-Zone A/C",
    },
    isDemoAsset: true,
  },
  {
    id: "all-terrain-4x4",
    index: "03",
    name: "All-Terrain 4×4",
    category: "Expedition & Coastal",
    tagline: "Purpose-built endurance for unpaved journeys.",
    description:
      "Rugged dependability and genuine multi-terrain prowess tailored for exploring destinations beyond the asphalt.",
    image: "/images/collection-03.jpg",
    specs: {
      seats: "5–7 Seats",
      transmission: "Manual / Auto",
      drivetrain: "Dual-Range 4WD",
    },
    isDemoAsset: true,
  },
];
