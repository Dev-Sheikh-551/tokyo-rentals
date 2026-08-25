import { contactConfig } from "@/config/contact";
import { vehicles } from "@/data/vehicles";

/**
 * JsonLd — Structured Data for Tokyo Rentals & Concierge
 *
 * Implements Schema.org structured data for AutoRental and LocalBusiness
 * to enable Google Rich Results, knowledge graph integration, and local search visibility.
 */
export default function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tokyorentals.gm";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AutoRental", "LocalBusiness"],
        "@id": `${siteUrl}/#business`,
        name: contactConfig.businessName,
        legalName: contactConfig.businessName,
        url: siteUrl,
        logo: `${siteUrl}/images/hero-cinematic.jpg`,
        image: `${siteUrl}/images/hero-cinematic.jpg`,
        description:
          "Discreet executive fleet and private travel across The Gambia. Premium vehicle rentals, chauffeured services, and personalized concierge mobility in Banjul and coastal regions.",
        telephone: contactConfig.phone || "+220 593 8108",
        email: contactConfig.email || "sheikhtijantouray551@gmail.com",
        priceRange: "$$$",
        currenciesAccepted: "GMD, USD, EUR, GBP",
        paymentAccepted: "Cash, Bank Transfer",
        areaServed: [
          {
            "@type": "Country",
            name: "The Gambia",
          },
          {
            "@type": "City",
            name: "Banjul",
          },
          {
            "@type": "City",
            name: "Serekunda",
          },
          {
            "@type": "City",
            name: "Senegambia",
          },
          {
            "@type": "City",
            name: "Brufut",
          },
          {
            "@type": "City",
            name: "Kololi",
          },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Banjul",
          addressCountry: "GM",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 13.4549,
          longitude: -16.579,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Vehicle Collection & Concierge Fleet",
          itemListElement: vehicles.map((v, i) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Car",
              name: v.name,
              category: v.category,
              description: v.description || v.tagline,
              image: `${siteUrl}${v.image}`,
            },
            position: i + 1,
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: contactConfig.businessName,
        description:
          "An uncompromising standard of automotive distinction in The Gambia.",
        publisher: {
          "@id": `${siteUrl}/#business`,
        },
        inLanguage: "en-GB",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
