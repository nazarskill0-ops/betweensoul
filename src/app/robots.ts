import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Serves /robots.txt.
 *
 * Two things are kept out. `/api/` is machinery — nothing under it renders, and
 * a crawler following those paths would only spend the report generation rate
 * limit. `/result` is somebody's relationship, written out in full: the link is
 * unguessable and expires in 24 hours, but a page that reachable should never
 * be one a search engine is walking into.
 *
 * robots.txt is a request, not a control — it asks crawlers not to fetch these
 * paths, which is why /result also carries `noindex` in its own metadata. A
 * page that is only disallowed here can still be indexed from a link elsewhere.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/result"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
