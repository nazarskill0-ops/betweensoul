import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SiteFooter } from "@/components/SiteFooter";
import {
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
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#fffbfd",
};

/**
 * Read at build time, so a deploy without the variable simply ships no
 * analytics rather than a broken tag — and local development doesn't send
 * pageviews into the production property unless the id is set there too.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SiteFooter />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
