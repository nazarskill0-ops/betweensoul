import { WhatKeepsYouTogether as WhatKeepsYouTogetherData } from "@/lib/types";
import { Insight } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 8 — love, comfort, habit or the cost of leaving, named.
 *
 * The main force is set as a headline rather than buried in a sentence, because
 * the honest version of this section is often a single uncomfortable noun and
 * burying it would be a way of not saying it. "Watch out for" is the other half
 * of that honesty and is styled as a warning rather than as more analysis.
 */
export function WhatKeepsYouTogether({
  id,
  data,
  generating,
}: {
  id?: string;
  data: WhatKeepsYouTogetherData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      sectionId="whatKeepsYouTogether"
      id={id}
      title="What's Actually Keeping You Together?"
      emoji="❤️"
      teaser="Love, comfort, habit or the cost of leaving — which one it actually is, and whether it's enough."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-4">
          <PreviewLines count={1} />
          <PreviewLines count={3} />
        </div>
      }
    >
      {(anchors) => (
        <div className="space-y-4">
          <div className="rounded-xl bg-accent-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              The main force
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
              {anchors.mainForce}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Also holding
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {anchors.alsoHolding.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-900/5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Insight label="⚠️ Watch out for" tone="amber">
            <p className="text-[15px] leading-relaxed text-slate-600">
              {anchors.watchOutFor}
            </p>
          </Insight>

          <div>
            <p className="text-base font-bold text-slate-900">Is it enough?</p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
              {anchors.isItEnough}
            </p>
          </div>
        </div>
      )}
    </PaidSection>
  );
}
