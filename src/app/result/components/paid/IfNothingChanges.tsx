import { IfNothingChanges as IfNothingChangesData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/** Position 17 — where the current patterns lead, framed as projection. */
export function IfNothingChanges({
  id,
  data,
  generating,
}: {
  id?: string;
  data: IfNothingChangesData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      sectionId="ifNothingChanges"
      id={id}
      title="If Nothing Changes"
      emoji="⏳"
      teaser="Based on your current patterns — what's likely to stay strong, what may get harder, and what becomes more important over time."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-4">
          <PreviewLines count={3} />
          <PreviewLines count={3} />
        </div>
      }
    >
      {(forecast) => (
        <div className="space-y-3">
          <Insight label="What stays strong" tone="green">
            <Prose text={forecast.likelyStrengths} />
          </Insight>
          <Insight label="Pressure points" tone="amber">
            <Prose text={forecast.pressurePoints} />
          </Insight>
          <Insight label="What becomes more important" tone="blue">
            <Prose text={forecast.whatBecomesMoreImportant} />
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
