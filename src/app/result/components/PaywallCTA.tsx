"use client";

import { UnlockButton } from "./shared/UnlockButton";

/**
 * The main conversion point, after all 21 sections.
 *
 * Every unlock button above this one opens the same checkout for the same
 * purchase — this one just arrives after the reader has seen everything the
 * free half has to say.
 */
const INCLUDED = [
  "Deep analysis of all 8 dimensions",
  "Every perception gap, with the conversation to have",
  "Your complete conflict pattern, stage by stage",
  "How you each show love — and how you each need it",
  "All 5 future scenarios, scored",
  "A personalized 7-day plan",
  "Our honest assessment of where you stand",
];

export function PaywallCTA() {
  return (
    <section className="rounded-2xl bg-white p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)] ring-1 ring-slate-900/5 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        Unlock your full CouplesScan report
      </h2>
      <p className="mt-2 text-[15px] text-slate-500">
        Ten more sections, written from all of your answers at once.
      </p>

      <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
        {INCLUDED.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] text-slate-700">
            <span className="mt-0.5 shrink-0 text-green-600">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-7 max-w-sm">
        <UnlockButton full />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        One-time purchase. No subscription. Secure checkout by Paddle.
      </p>
    </section>
  );
}
