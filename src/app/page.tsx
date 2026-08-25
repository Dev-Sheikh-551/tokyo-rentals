import Hero from "@/components/hero/Hero";
import Collection from "@/components/collection/Collection";
import Experience from "@/components/experience/Experience";
import Enquiry from "@/components/enquiry/Enquiry";
import Footer from "@/components/footer/Footer";
import { EnquiryProvider } from "@/components/enquiry/EnquiryContext";
import { VehicleDetailProvider } from "@/components/vehicle/VehicleDetailContext";

export default function Home() {
  return (
    <EnquiryProvider>
      <VehicleDetailProvider>
        {/* Phase 01 — Cinematic Hero Opening */}
        <Hero />

        {/* Phase 02 — The Collection: Pinned Horizontal Showroom */}
        <Collection />

        {/*
          Transition spacer — visual decompression between Collection and Experience.
          Horizontal fleet movement decelerates; the screen quiets.
        */}
        <div
          aria-hidden="true"
          className="relative w-full h-[8vh] sm:h-[12vh] bg-obsidian-950 pointer-events-none"
        />

        {/* Phase 03 — The Experience: Cinematic Editorial Storytelling */}
        <Experience />

        {/* Phase 04 & 05 — The Enquiry: First Conversion Point & Backend */}
        <Enquiry />

        {/* Phase 06 — The Closing Frame: Cinematic Ending & Index */}
        <Footer />
      </VehicleDetailProvider>
    </EnquiryProvider>
  );
}
