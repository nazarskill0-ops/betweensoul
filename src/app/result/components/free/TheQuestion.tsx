import { TheQuestion as TheQuestionData } from "@/lib/types";

/**
 * Position 19 — the one question, and the emotional turn into the finale.
 *
 * Quiet and almost empty compared to everything above it: the weight comes from
 * the space around the question and the size of the type, not from inverting
 * the card. The link points at position 21, which is the answer to exactly this
 * question — locked or not, it is where the reader wants to go next.
 */
export function TheQuestion({
  data,
  locked,
}: {
  data: TheQuestionData;
  locked: boolean;
}) {
  return (
    <section className="card px-6 py-12 text-center sm:px-10 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        The Question
      </p>

      <p className="mx-auto mt-6 max-w-lg text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
        &ldquo;{data.question}&rdquo;
      </p>

      <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-slate-500">
        {data.hook}
      </p>

      <a
        href="#the-answer"
        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        {locked ? "🔒 See the answer" : "See the answer ↓"}
      </a>
    </section>
  );
}
