import { DIMENSION_IDS, DIMENSION_LABELS, XRayDimension } from "@/lib/types";
import { ScoreBar } from "../shared/ScoreBar";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";
import { DIMENSION_EMOJI } from "../shared/scale";

/**
 * Position 6 — the first locked section, and the one that answers the question
 * the tension section just raised.
 *
 * The preview names three real dimensions so the reader can see this is their
 * report continuing rather than a generic upsell.
 */
function Preview() {
  return (
    <div className="space-y-5">
      {DIMENSION_IDS.slice(0, 3).map((id) => (
        <div key={id} className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-slate-900">
              {DIMENSION_EMOJI[id]} {DIMENSION_LABELS[id]}
            </span>
            <span className="text-lg font-bold text-slate-400">••</span>
          </div>
          <PreviewLines count={3} />
        </div>
      ))}
    </div>
  );
}

export function FullXRay({
  id,
  data,
  generating,
}: {
  id?: string;
  data: XRayDimension[] | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      id={id}
      title="Full Relationship X-Ray"
      emoji="🩻"
      teaser="Deep analysis of all 8 dimensions — what we see, what your answers reveal, where you differ, and what could help."
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(xray) => (
        <div className="space-y-8">
          {xray.map((dimension) => (
            <div key={dimension.dimensionId} className="space-y-3">
              <ScoreBar
                name={dimension.dimensionName}
                emoji={DIMENSION_EMOJI[dimension.dimensionId]}
                score={dimension.score}
              />
              <Insight label="What we see">
                <Prose text={dimension.whatWeSee} />
              </Insight>
              <Insight label="What your answers suggest" tone="blue">
                <Prose text={dimension.whatAnswersSuggest} />
              </Insight>
              <Insight label="Where you differ" tone="amber">
                <Prose text={dimension.whereYouDiffer} />
              </Insight>
              <Insight label="What could help" tone="green">
                <Prose text={dimension.whatCouldHelp} />
              </Insight>
            </div>
          ))}
        </div>
      )}
    </PaidSection>
  );
}
