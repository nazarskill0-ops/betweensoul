import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal";

/**
 * Sits in the root layout, so every route carries the legal links — Lemon
 * Squeezy expects them reachable from anywhere a purchase can start, which
 * includes the result page.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto px-5 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-3 border-t border-lilac-200 pt-6 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-ink-500 transition-colors hover:text-ink-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-ink-300">
          © {new Date().getFullYear()} BetweenSoul · Not therapy or clinical
          advice.
        </p>
      </div>
    </footer>
  );
}
