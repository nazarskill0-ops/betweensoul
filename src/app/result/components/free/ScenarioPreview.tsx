import { ScenarioPreview as ScenarioPreviewData } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";
import { SCENARIO_EMOJI } from "../shared/scale";

/** Position 15 — five futures, one sentence each. */
export function ScenarioPreview({
  scenarios,
  locked,
}: {
  scenarios: ScenarioPreviewData[];
  locked: boolean;
}) {
  return (
    <SectionCard title="What Happens If…" emoji="🔮">
      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
          >
            <p className="text-[15px] font-semibold text-slate-900">
              <span className="mr-1.5">{SCENARIO_EMOJI[scenario.id]}</span>
              {scenario.name}
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
              {scenario.teaser}
            </p>
            {locked && (
              <p className="mt-2 text-xs font-medium text-slate-400">
                🔒 Full analysis in the complete report
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
