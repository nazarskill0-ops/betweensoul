import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

/** Loaded here, applied only by the report — see globals.css `--font-report`. */
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
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
