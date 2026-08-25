import type { Metadata, Viewport } from "next";
import { cormorant, jakarta, pinyon } from "@/lib/fonts";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import GrainOverlay from "@/components/layout/GrainOverlay";
import Navbar from "@/components/navigation/Navbar";

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "TOKYO RENTALS & CONCIERGE | Luxury Automotive & Private Travel",
  description:
    "A considered selection of premium vehicles and discreet personal mobility in The Gambia.",
  keywords: [
    "Tokyo Rentals",
    "Tokyo Concierge",
    "Luxury Car Rental The Gambia",
    "Banjul Car Rental",
    "Executive Vehicle Hire West Africa",
  ],
  icons: {
    icon: "/favicon.ico",
  },
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
      <body className="min-h-screen bg-obsidian-950 text-warm-ivory flex flex-col relative overflow-x-hidden selection:bg-champagne/30 selection:text-warm-ivory">
        <SmoothScroll>
          <GrainOverlay />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
