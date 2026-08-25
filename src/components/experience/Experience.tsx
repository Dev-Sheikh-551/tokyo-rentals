"use client";

import ExperienceHero from "./ExperienceHero";
import ExperienceStory from "./ExperienceStory";

/**
 * Experience — Phase 03 orchestrator.
 *
 * Composes the two acts of The Experience section:
 *   1. ExperienceHero — primary cinematic image with layered parallax
 *   2. ExperienceStory — secondary detail beat with clip-path reveal
 *
 * The transition from Collection is bridged by the Collection's own
 * bottom gradient bleed + ExperienceHero's top-to-transparent gradient,
 * creating a continuous visual decompression from horizontal fleet
 * movement into quiet vertical depth.
 */
export default function Experience() {
  return (
    <div id="experience-chapter" className="relative bg-obsidian-950">
      {/* Act I — Primary cinematic image */}
      <ExperienceHero />

      {/* Act II — Secondary detail story beat */}
      <ExperienceStory />
    </div>
  );
}
