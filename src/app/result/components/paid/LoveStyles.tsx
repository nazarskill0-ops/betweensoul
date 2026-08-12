import { LoveStyles as LoveStylesData } from "@/lib/types";
import { Insight, PartnerSplit, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/** Position 12 — what each of them gives, and what each of them needs. */
function Preview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-[var(--color-p1-soft)] p-4">
        <PreviewLines count={3} />
      </div>
      <div className="rounded-xl bg-[var(--color-p2-soft)] p-4">
        <PreviewLines count={3} />
      </div>
    </div>
  );
}

export function LoveStyles({
  id,
  data,
  generating,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: LoveStylesData | null | undefined;
  generating: boolean;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="loveStyles"
      id={id}
      title="How You Show Love vs How You Feel Loved"
      emoji="💞"
      teaser="Your answers suggest you may be showing love in ways your partner doesn't fully receive."
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(love) => (
        <div className="space-y-3">
          <PartnerSplit
            p1Label={`${p1Name} shows love by`}
            p2Label={`${p2Name} shows love by`}
            p1Text={love.partner1Shows}
            p2Text={love.partner2Shows}
          />
          <PartnerSplit
            p1Label={`${p1Name} feels loved when`}
            p2Label={`${p2Name} feels loved when`}
            p1Text={love.partner1FeelsLovedBy}
            p2Text={love.partner2FeelsLovedBy}
          />
          <Insight label="Where you miss each other" tone="amber">
            <Prose text={love.mismatch} />
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
