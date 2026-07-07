import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="uk" className={`${manrope.variable} ${syne.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-Q4JQ7H4RGH" />
    </html>
  );
}