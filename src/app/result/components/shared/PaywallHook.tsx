"use client";

import { useUnlock } from "./UnlockButton";

/**
 * The line that closes a teaser section, and the button under it.
 *
 * Every free section now stops one step short of the thing the reader wants —
 * three scenarios of five, one gap of four, the pattern named but not
 * explained — and this is where that debt is called in. The question is written
 * per section because a hook that could be pasted under any of them ("Unlock
 * the full report") is one the reader has already learned to skip; the button
 * opens the one modal that carries the price, exactly like the blurred paid
 * cards do, so the page still states the price once rather than nine times.
 */
export function PaywallHook({
  question,
  cta,
}: {
  /** What this particular section left unanswered. */
  question: string;
  cta: string;
}) {
  const { openModal } = useUnlock();

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="text-[15px] font-semibold text-slate-900">{question}</p>
      <button onClick={openModal} className="btn-unlock mt-3 w-full sm:w-auto">
        {cta}
      </button>
    </div>
  );
}
