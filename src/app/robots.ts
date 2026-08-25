import { MetadataRoute } from "next";

/**
 * Robots.txt Generator — Tokyo Rentals & Concierge
 *
 * Directs search engine crawlers and declares the location of sitemap.xml.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyorentals.gm";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
