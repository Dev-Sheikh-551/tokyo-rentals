import { MetadataRoute } from "next";

/**
 * Dynamic Sitemap Generator — Tokyo Rentals & Concierge
 *
 * Generates /sitemap.xml for search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyorentals.gm";
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#collection`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#experience`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#enquiry`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
