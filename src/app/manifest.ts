import { MetadataRoute } from "next";

/**
 * Web App Manifest Generator — Tokyo Rentals & Concierge
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TOKYO RENTALS & CONCIERGE",
    short_name: "Tokyo Rentals",
    description:
      "A considered selection of premium vehicles and discreet personal mobility in The Gambia.",
    start_url: "/",
    display: "standalone",
    background_color: "#060608",
    theme_color: "#060608",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
