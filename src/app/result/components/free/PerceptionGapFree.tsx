import { PerceptionGap } from "@/lib/types";
import { Insight, Prose, SectionCard } from "../shared/SectionCard";

/**
 * Position 8 — one gap, shown in full.
 *
 * The count of what's left is the tease, and it is honest: the number comes
 * from how many gaps the model actually found in their answers, not from a
 * fixed "and 4 more" written into the page.
 */
export function PerceptionGapFree({
  data,
  p1Name,
  p2Name,
  locked,
}: {
  data: PerceptionGap;
  p1Name: string;
  p2Name: string;
  locked: boolean;
}) {
  const remaining = Math.max(0, data.totalGapsFound - data.shown.length);

  return (
    <SectionCard title="The Perception Gap" emoji="🔀">
      <div className="space-y-6">
        {data.shown.map((gap) => (
          <div key={gap.topic} className="space-y-3">
            <p className="text-base font-semibold text-slate-900">{gap.topic}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--color-p1-soft)] p-4">
                <p className="text-xs font-semibold text-[var(--color-p1)]">
                  {p1Name} feels:
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  {gap.partner1Said}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-p2-soft)] p-4">
                <p className="text-xs font-semibold text-[var(--color-p2)]">
                  {p2Name} feels:
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  {gap.partner2Said}
                </p>
              </div>
            </div>

            <Insight label="Why this matters">
              <Prose text={gap.aiComment} />
            </Insight>
          </div>
        ))}
      </div>

      {locked && remaining > 0 && (
        <p className="mt-5 border-t border-slate-100 pt-4 text-[15px] font-medium text-slate-500">
          🔒 {remaining} more perception {remaining === 1 ? "gap" : "gaps"} found in
          your answers
        </p>
      )}
    </SectionCard>
  );
}
