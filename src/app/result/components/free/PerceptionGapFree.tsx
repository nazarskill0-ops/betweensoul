import { PerceptionGap } from "@/lib/types";
import { Insight, SectionCard } from "../shared/SectionCard";
import { PaywallHook } from "../shared/PaywallHook";

/**
 * Position 8 — one gap, shown in full.
 *
 * The count of what's left is the tease, and it is honest: the number comes
 * from how many gaps the model actually found in their answers, not from a
 * fixed "and 4 more" written into the page. When it found only the one, the
 * hook disappears rather than promising nothing.
 *
 * Both sides keep their names and their colours instead of "you" and "them".
 * Two people are reading this on one phone, and "you" belongs to whichever of
 * them is holding it.
 *
 * Headed 🔀 rather than the 👀 this section is drawn with elsewhere: the paid
 * "How You Really See Each Other" already carries 👀, and two sections on one
 * page under one glyph read as the same section twice.
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
                  {p1Name}:
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  {gap.partner1Said}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-p2-soft)] p-4">
                <p className="text-xs font-semibold text-[var(--color-p2)]">
                  {p2Name}:
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  {gap.partner2Said}
                </p>
              </div>
            </div>

            <Insight label="What this might mean">
              <p className="text-[15px] leading-relaxed text-slate-600">
                {gap.aiComment}
              </p>
            </Insight>
          </div>
        ))}
      </div>

      {locked && remaining > 0 && (
        <PaywallHook
          question={`There ${remaining === 1 ? "is" : "are"} ${remaining} more ${
            remaining === 1 ? "difference" : "differences"
          } in your answers.`}
          cta="🔒 See all perception gaps"
        />
      )}
    </SectionCard>
  );
}
