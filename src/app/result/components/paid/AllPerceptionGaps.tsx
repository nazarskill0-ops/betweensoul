import { FullPerceptionGap } from "@/lib/types";
import { PartnerSplit } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 2 — every gap, one numbered card each.
 *
 * The numbering is the point: the free page said how many were found, and the
 * buyer should be able to count them off. Each card is a bordered block rather
 * than a run of paragraphs so that five of them read as five findings instead
 * of one long essay about disagreeing.
 */
function Preview() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 h-3.5 w-2/5 rounded-full bg-slate-200" />
          <PreviewLines count={2} />
        </div>
      ))}
    </div>
  );
}

export function AllPerceptionGaps({
  id,
  data,
  generating,
  totalGapsFound,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: FullPerceptionGap[] | null | undefined;
  generating: boolean;
  totalGapsFound: number;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="allPerceptionGaps"
      id={id}
      title="Every Perception Gap"
      emoji="🪞"
      teaser={`All ${totalGapsFound} places where you see the same relationship differently — with what each difference actually does to you.`}
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(gaps) => (
        <div className="space-y-4">
          {gaps.map((gap, i) => (
            <div
              key={gap.topic}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Gap #{i + 1}
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">{gap.topic}</p>

              <div className="mt-3">
                <PartnerSplit
                  p1Label={`${p1Name}:`}
                  p2Label={`${p2Name}:`}
                  p1Text={gap.partner1Said}
                  p2Text={gap.partner2Said}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Why it matters
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                  {gap.whyItMatters}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PaidSection>
  );
}
