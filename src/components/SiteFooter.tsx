"use client";

import Link from "next/link";
import { openCookieSettings } from "@/components/CookieConsent";
import { LEGAL_LINKS } from "@/lib/legalLinks";

/**
 * Sits in the root layout, so every route carries the legal links — Paddle
 * expects them reachable from anywhere a purchase can start, which includes
 * the result page.
 *
 * The Cookies entry is the way back into a dialog that otherwise appears once.
 * It sits with the legal links rather than off on its own because that is the
 * corner people already look in for this.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto px-5 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-3 border-t border-slate-200 pt-6 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-slate-500 transition-colors hover:text-slate-600"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={openCookieSettings}
            className="font-semibold text-slate-500 transition-colors hover:text-slate-600"
          >
            Cookies
          </button>
        </nav>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} CoupleScan · Not therapy or clinical
          advice.
        </p>
      </div>
    </footer>
  );
}
