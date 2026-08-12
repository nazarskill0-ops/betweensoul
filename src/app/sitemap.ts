import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Serves /sitemap.xml.
 *
 * Only the four pages worth ranking. The funnel — /test, /questions,
 * /analyzing — is left out on purpose: those are steps, not destinations, and
 * two of the three are blank without a test in progress. /result is a private
 * report and is excluded everywhere.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["terms", "privacy", "refund"].map((path) => ({
      url: `${SITE_URL}/${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
