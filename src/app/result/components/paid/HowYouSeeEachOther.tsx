import { HowYouSeeEachOther as HowYouSeeEachOtherData } from "@/lib/types";
import { Insight, PartnerSplit, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Position 14 — each partner's read on the other.
 *
 * The two labels stay sharp in the preview because naming them is the tease:
 * "how she sees him" is a question most couples answer differently in their
 * heads than they would out loud.
 */
function Preview({ p1Name, p2Name }: { p1Name: string; p2Name: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-[var(--color-p1-soft)] p-4">
        <p className="text-xs font-semibold text-[var(--color-p1)]">
          How {p1Name} sees {p2Name}
        </p>
        <div className="locked-preview mt-3">
          <PreviewLines count={3} />
        </div>
      </div>
      <div className="rounded-xl bg-[var(--color-p2-soft)] p-4">
        <p className="text-xs font-semibold text-[var(--color-p2)]">
          How {p2Name} sees {p1Name}
        </p>
        <div className="locked-preview mt-3">
          <PreviewLines count={3} />
        </div>
      </div>
    </div>
  );
}

export function HowYouSeeEachOther({
  id,
  data,
  generating,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: HowYouSeeEachOtherData | null | undefined;
  generating: boolean;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="howYouSeeEachOther"
      id={id}
      title="How You Really See Each Other"
      emoji="👀"
      teaser="Plus: what you're both missing about each other."
      data={data}
      generating={generating}
      preview={<Preview p1Name={p1Name} p2Name={p2Name} />}
      blurPreview={false}
    >
      {(view) => (
        <div className="space-y-3">
          <PartnerSplit
            p1Label={`How ${p1Name} sees ${p2Name}`}
            p2Label={`How ${p2Name} sees ${p1Name}`}
            p1Text={view.herViewOfHim}
            p2Text={view.hisViewOfHer}
          />
          <Insight label="What you both miss" tone="blue">
            <Prose text={view.whatBothMiss} />
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
