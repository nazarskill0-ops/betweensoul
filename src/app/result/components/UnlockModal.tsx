"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legalLinks";
import { PAID_SECTION_LIST } from "../paidSections";
import {
  FULL_PRICE,
  OFFER_LABEL,
  PRICE,
  useUnlock,
} from "./shared/UnlockButton";

/**
 * The one place the report is actually sold.
 *
 * Everything that used to carry a price — a button on each of the ten blurred
 * sections — now opens this instead. The whole point is that the price is
 * stated once, against a list of everything it buys, so a reader can see they
 * are buying a report rather than a section.
 *
 * A bottom sheet on a phone and a centred dialog above it: the list runs to ten
 * rows plus a header and a footer, which is most of a small screen, and a
 * sheet that owns the bottom of the viewport puts the button where a thumb
 * already is.
 */
export function UnlockModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { startCheckout, loading, error } = useUnlock();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // The sheet scrolls on its own; the report behind it must not scroll with
    // it, or dismissing the sheet leaves the reader somewhere they never went.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Moves the keyboard into the dialog, so the first Tab lands on the CTA
    // rather than on whatever link was focused behind it.
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-modal-title"
        tabIndex={-1}
        // The overlay closes on click; the panel must not pass its own clicks up.
        onClick={(event) => event.stopPropagation()}
        // A column with one scrolling band in the middle. Ten rows plus a
        // header and a footer is taller than a phone, and letting the whole
        // sheet scroll pushed the button that closes the sale off the bottom
        // of the screen — the reader had to scroll a sales pitch to find the
        // way to buy. Only the list moves now; the price and the button stay.
        className="animate-in-up flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl bg-white outline-none sm:max-h-[88vh] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-start gap-3 p-6 pb-0 sm:p-7 sm:pb-0">
          <div className="flex-1">
            <h2
              id="unlock-modal-title"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Unlock Your Full Report
            </h2>
            <p className="mt-1 text-[15px] text-slate-500">
              One payment — all 10 sections
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-xl leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-5 sm:px-7">
          {PAID_SECTION_LIST.map((section) => (
            <li key={section.id} className="flex gap-2.5 text-[15px] text-slate-700">
              <span aria-hidden className="shrink-0">
                {section.emoji}
              </span>
              <span>{section.modalTeaser}</span>
            </li>
          ))}
        </ul>

        <div className="shrink-0 border-t border-slate-100 p-6 pt-4 sm:p-7 sm:pt-4">
          {/* The old price first and smaller, so the eye lands on what is
              actually being charged rather than on the number being crossed
              out. `line-through` on the text itself, not a decorative rule —
              a screen reader announcing "$14.99 $9.99" with no indication one
              is void would be reading out the wrong price. */}
          <div className="text-center">
            <p className="flex items-baseline justify-center gap-2.5">
              <s className="text-base text-slate-400">
                <span className="sr-only">Was </span>
                {FULL_PRICE}
              </s>
              <span className="text-3xl font-bold tracking-tight text-accent-500">
                {PRICE}
              </span>
            </p>
            <p className="mt-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-600">
                <span aria-hidden>🏷️</span>
                {OFFER_LABEL}
              </span>
            </p>
          </div>

          <button
            onClick={startCheckout}
            disabled={loading}
            className="btn-primary mt-3"
          >
            {loading ? "Opening checkout…" : "Unlock Full Report 🔓"}
          </button>

          {error && (
            <p className="mt-2 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            One-time payment · No subscription
          </p>

          <nav className="mt-3 flex justify-center gap-5 text-xs">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-slate-400 transition-colors hover:text-slate-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
