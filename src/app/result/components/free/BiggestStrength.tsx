import { BiggestStrength as BiggestStrengthData } from "@/lib/types";
import { ScoreBar } from "../shared/ScoreBar";
import { Insight, Prose, SectionCard } from "../shared/SectionCard";
import { DIMENSION_EMOJI } from "../shared/scale";

/** Position 4 — the good news, before the page asks for anything. */
export function BiggestStrength({ data }: { data: BiggestStrengthData }) {
  return (
    <SectionCard title="Your Biggest Strength" emoji="💪" accent="green">
      <ScoreBar
        name={data.dimensionName}
        emoji={DIMENSION_EMOJI[data.dimensionId]}
        score={data.score}
      />
      <div className="mt-4">
        <Prose text={data.explanation} />
      </div>
      <div className="mt-4">
        <Insight label="Why this matters" tone="green">
          <Prose text={data.whyItMatters} />
        </Insight>
      </div>
    </SectionCard>
  );
}
