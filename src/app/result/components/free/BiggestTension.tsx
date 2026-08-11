import { BiggestTension as BiggestTensionData } from "@/lib/types";
import { ScoreBar } from "../shared/ScoreBar";
import { Prose, SectionCard } from "../shared/SectionCard";
import { DIMENSION_EMOJI } from "../shared/scale";

/**
 * Position 5 — the problem, stated but not explained.
 *
 * The hook at the bottom is the hinge of the whole page: the X-ray that
 * follows is the answer to the question this section leaves open, which is why
 * it is the first locked section rather than one buried further down.
 */
export function BiggestTension({ data }: { data: BiggestTensionData }) {
  return (
    <>
      <SectionCard title="Your Biggest Tension" emoji="⚡" accent="amber">
        <ScoreBar
          name={data.dimensionName}
          emoji={DIMENSION_EMOJI[data.dimensionId]}
          score={data.score}
        />
        <div className="mt-4">
          <Prose text={data.explanation} />
        </div>
        <p className="mt-5 text-[15px] font-semibold text-slate-900">
          Want to understand what&rsquo;s really behind this?
        </p>
      </SectionCard>

      <div className="-my-1 text-center text-2xl text-slate-300" aria-hidden>
        ↓
      </div>
    </>
  );
}
