import { FullPerceptionGap } from "@/lib/types";
import { Insight, PartnerSplit, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/** Position 9 — every gap, with the conversation to have about each one. */
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
      title="All Perception Gaps"
      emoji="🪞"
      teaser={`We found ${totalGapsFound} places where you see the relationship differently. Each gap includes what it may mean and a specific conversation to have about it.`}
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(gaps) => (
        <div className="space-y-8">
          {gaps.map((gap) => (
            <div key={gap.topic} className="space-y-3">
              <p className="text-base font-semibold text-slate-900">{gap.topic}</p>
              <PartnerSplit
                p1Label={`${p1Name} feels:`}
                p2Label={`${p2Name} feels:`}
                p1Text={gap.partner1Said}
                p2Text={gap.partner2Said}
              />
              <Prose text={gap.whatThisMayMean} />
              <Insight label="Why it matters" tone="amber">
                <Prose text={gap.whyItMatters} />
              </Insight>
              <Insight label="The conversation to have" tone="green">
                <p className="text-[15px] leading-relaxed text-slate-700">
                  &ldquo;{gap.conversationToHave}&rdquo;
                </p>
              </Insight>
            </div>
          ))}
        </div>
      )}
    </PaidSection>
  );
}
