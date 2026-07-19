import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Syne is kept only for the "calmi" logo (font-logo) — every other heading
// now renders in Inter via font-display.
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Calmi — Платформа для українських психологів та психотерапевтів",
  description:
    "Calmi залучає клієнтів і направляє їх до психологів. Онлайн-сесії, оплата та бронювання — все на одній платформі.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className={`${inter.variable} ${syne.variable}`}>
      <body className="min-h-dvh">
        <Providers>
          <AppHeader />
          {children}
          <AppFooter />
          </Providers>
      </body>
      <GoogleAnalytics gaId="G-Q4JQ7H4RGH" />
    </html>
  );
}
