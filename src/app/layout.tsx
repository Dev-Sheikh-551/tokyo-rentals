import type { Metadata, Viewport } from "next";
import { cormorant, jakarta, pinyon } from "@/lib/fonts";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import GrainOverlay from "@/components/layout/GrainOverlay";
import Navbar from "@/components/navigation/Navbar";
import TargetCursor from "@/components/ui/TargetCursor";
import JsonLd from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyorentals.gm";

export const viewport: Viewport = {
  themeColor: "#060608",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TOKYO RENTALS & CONCIERGE | Luxury Automotive & Private Travel",
    template: "%s | Tokyo Rentals & Concierge",
  },
  description:
    "A considered selection of premium vehicles and discreet personal mobility in The Gambia. Executive fleet, chauffeured travel, and private concierge in Banjul.",
  applicationName: "Tokyo Rentals & Concierge",
  authors: [{ name: "Tokyo Rentals & Concierge" }],
  creator: "Tokyo Rentals & Concierge",
  publisher: "Tokyo Rentals & Concierge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "Tokyo Rentals",
    "Tokyo Concierge",
    "Luxury Car Rental The Gambia",
    "Car Rental Banjul",
    "Executive Vehicle Hire The Gambia",
    "Private Chauffeur Gambia",
    "VIP Car Rental Banjul",
    "4x4 Hire Gambia",
    "Luxury SUV Rental Senegambia",
    "Gambia Airport Transfer Luxury",
    "Executive Mobility West Africa",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Tokyo Rentals & Concierge",
    title: "TOKYO RENTALS & CONCIERGE | Luxury Automotive & Private Travel",
    description:
      "A considered selection of premium vehicles and discreet personal mobility in The Gambia. Executive fleet and chauffeured travel in Banjul.",
    images: [
      {
        url: "/images/hero-cinematic.jpg",
        width: 1920,
        height: 1080,
        alt: "Tokyo Rentals & Concierge — Luxury Automotive & Private Travel in The Gambia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOKYO RENTALS & CONCIERGE | Luxury Automotive & Private Travel",
    description:
      "A considered selection of premium vehicles and discreet personal mobility in The Gambia.",
    images: ["/images/hero-cinematic.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "I_94vyJz3gC0rfG0v2QrV9Y4T8MtkFhAvNeF5n_Udms",
  },
  category: "Automotive & Concierge Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${pinyon.variable} bg-obsidian-950 text-warm-ivory h-full antialiased`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-obsidian-950 text-warm-ivory flex flex-col relative overflow-x-hidden selection:bg-champagne/30 selection:text-warm-ivory">
        <SmoothScroll>
          <GrainOverlay />
          <TargetCursor
            spinDuration={3}
            hideDefaultCursor={true}
            parallaxOn={true}
            cursorColor="#ffffff"
            cursorColorOnTarget="#c4a676"
          />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
