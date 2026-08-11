import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

/** The whole site's face. See `--font-sans` in globals.css. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CouplesScan — How Strong Is Your Love?",
  description:
    "Take the relationship test together with your partner from one device. Our AI reads both sets of answers and tells you the truth about where you stand.",
};

export const viewport: Viewport = {
  themeColor: "#fffbfd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
