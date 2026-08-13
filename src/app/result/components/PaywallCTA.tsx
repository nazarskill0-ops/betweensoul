"use client";

import { PAID_SECTION_LIST } from "../paidSections";
import { useUnlock } from "./shared/UnlockButton";

/**
 * The main conversion point, after all 21 sections.
 *
 * Everything above this opens the same modal for the same purchase — this one
 * just arrives after the reader has seen everything the free half has to say,
 * and it lists the same ten lines the modal does. It used to keep its own
 * seven-item summary, written differently, so the page made two offers that
 * did not match: the reader saw one list here and another the moment they
 * tapped the button.
 */

export function PaywallCTA() {
  const { openModal } = useUnlock();

  return (
    <section className="rounded-2xl bg-white p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)] ring-1 ring-slate-900/5 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        Unlock your full CoupleScan report
      </h2>
      <p className="mt-2 text-[15px] text-slate-500">
        Ten more sections, written from all of your answers at once.
      </p>

      <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
        {PAID_SECTION_LIST.map((section) => (
          <li
            key={section.id}
            className="flex gap-2.5 text-[15px] text-slate-700"
          >
            <span aria-hidden className="shrink-0">
              {section.emoji}
            </span>
            <span>{section.modalTeaser}</span>
          </li>
        ))}
      </ul>

      {/* Opens the modal rather than the checkout: the price and the full list
          of what it buys are stated there, once, for the whole page. */}
      <div className="mx-auto mt-7 max-w-sm">
        <button onClick={openModal} className="btn-primary">
          Unlock Full Report 🔓
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        One-time purchase. No subscription. Secure checkout by Paddle.
      </p>
    </section>
  );
}
