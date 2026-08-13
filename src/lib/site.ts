/**
 * Where the site lives, in one place.
 *
 * `metadataBase`, the sitemap, robots.txt and every canonical link all need the
 * production origin, and a stale copy in one of them is the kind of mistake
 * that only shows up in Search Console weeks later.
 */
export const SITE_URL = "https://couplescan.com";

/**
 * The site-wide title and description, shared by the `<title>`, the Open Graph
 * tags and the Twitter card so the three can't drift apart.
 */
export const SITE_NAME = "CoupleScan";
export const SITE_TITLE = "CoupleScan — AI Relationship Compatibility Test";
export const SITE_DESCRIPTION =
  "Take a 15-question quiz with your partner and get an AI-powered compatibility report with personalized insights for your relationship.";

/**
 * Metadata for one of the three legal pages.
 *
 * Open Graph does not inherit from `title` and `description` — it inherits the
 * parent's `openGraph` object — so a page that only sets the two would keep the
 * homepage's card, and a shared link to the refund policy would preview as "AI
 * Relationship Compatibility Test". Setting all four together is what keeps the
 * tab title, the canonical and the shared card describing the same page.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Leading slash, matching the route. */
  path: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website" as const,
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}
