/**
 * One "who is more…" comparison.
 *
 * The marker sits at `position` on a track running from partner 1 to partner 2,
 * so 20 means "mostly the first partner" and 80 "mostly the second". Names are
 * printed once above the whole set rather than on every row — six repetitions
 * of the same two names is noise, and the track colours carry the mapping.
 */
export function SliderBar({
  question,
  position,
}: {
  question: string;
  position: number;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[15px] font-medium text-slate-700">{question}</p>
      <div className="relative py-2">
        <div className="h-2.5 rounded-full bg-gradient-to-r from-[var(--color-p1)] via-slate-200 to-[var(--color-p2)] opacity-90" />
        <span
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-slate-800 shadow-md"
          style={{ left: `${position}%` }}
        />
      </div>
    </div>
  );
}
