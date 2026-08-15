import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { SiteFooter } from "@/components/SiteFooter";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

/** The whole site's face. See `--font-sans` in globals.css. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The defaults every route inherits.
 *
 * `metadataBase` is what lets the pages below write `canonical: "/terms"`
 * instead of repeating the origin — and it is also what turns a relative Open
 * Graph image path into the absolute URL the crawlers require.
 *
 * Deliberately no `alternates.canonical` here: metadata set on the root layout
 * is inherited, so a canonical at this level would point every page on the site
 * at the homepage. Each page declares its own.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  /**
   * The files in `public/`, declared rather than discovered.
   *
   * `src/app/favicon.ico` used to sit here doing this job by convention, and
   * it was still the framework's default black triangle — the site has been
   * shipping someone else's logo in the tab. Deleting it hands `/favicon.ico`
   * back to `public/`, which is where the rest of the set lives.
   *
   * The .ico is a single 16x16 image, so the 32x32 PNG beside it is not
   * redundant: browsers that prefer PNG take the crisp one for retina tabs and
   * bookmark bars, and the ico stays for the ones that only ever ask for it.
   */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#fffbfd",
};

/**
 * Read at build time, so a deploy without the variable simply ships no
 * analytics rather than a broken tag — and local development doesn't send
 * pageviews into the production property unless the id is set there too.
 *
 * It is handed to the consent banner rather than to the tag directly: nothing
 * loads until the reader has said yes. See CookieConsent.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SiteFooter />
        <CookieConsent gaId={GA_ID} />
      </body>
    </html>
  );
}
