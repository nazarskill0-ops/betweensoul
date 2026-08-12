import { SCENARIO_IDS, SCENARIO_LABELS, ScenarioAnalysis } from "@/lib/types";
import { ScoreBar } from "../shared/ScoreBar";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";
import { SCENARIO_EMOJI } from "../shared/scale";

/**
 * Position 16 — the five scenarios, scored.
 *
 * Names sharp, scores hidden: the reader has already read the one-line teasers
 * upstairs, so what's missing here is the number and the advice.
 */
function Preview() {
  return (
    <div className="space-y-4">
      {SCENARIO_IDS.slice(0, 3).map((id) => (
        <div key={id} className="rounded-xl bg-white p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-slate-900">
              {SCENARIO_EMOJI[id]} {SCENARIO_LABELS[id]}
            </span>
            <span className="locked-preview text-lg font-bold text-slate-500">
              72
            </span>
          </div>
          <div className="locked-preview mt-3">
            <PreviewLines count={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScenarioLab({
  id,
  data,
  generating,
}: {
  id?: string;
  data: ScenarioAnalysis[] | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      sectionId="scenarioLab"
      id={id}
      title="Life Scenario Lab"
      emoji="🧪"
      teaser="A compatibility score, the strengths, the risks and specific advice for each of the five scenarios."
      data={data}
      generating={generating}
      preview={<Preview />}
      blurPreview={false}
    >
      {(lab) => (
        <div className="space-y-8">
          {lab.map((scenario) => (
            <div key={scenario.id} className="space-y-3">
              <ScoreBar
                name={scenario.name}
                emoji={SCENARIO_EMOJI[scenario.id]}
                score={scenario.compatibility}
              />
              <Insight label="What would work" tone="green">
                <Prose text={scenario.strength} />
              </Insight>
              <Insight label="The risk" tone="amber">
                <Prose text={scenario.risk} />
              </Insight>
              <Insight label="What you'd struggle with">
                <Prose text={scenario.whatYoudStruggleWith} />
              </Insight>
              <Insight label="What would help" tone="blue">
                <Prose text={scenario.whatWouldHelp} />
              </Insight>
            </div>
          ))}
        </div>
      )}
    </PaidSection>
  );
}
