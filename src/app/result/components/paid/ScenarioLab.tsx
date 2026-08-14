import { ScenarioAnalysis } from "@/lib/types";
import { PaidSection, PreviewLines } from "../shared/LockedSection";
import { RISK_BADGE, SCENARIO_EMOJI } from "../shared/scale";

/**
 * Paid 6 — all five futures, one card each.
 *
 * The free page rated three of these at a glance and shut the other two; this
 * is the same five with the reasoning, and the badge carries the verdict so a
 * reader skimming five cards still gets the answer from each one before
 * deciding whether to read it.
 *
 * A named risk level rather than a compatibility score out of 100, which is
 * what used to sit here. Five two-digit numbers invited arithmetic between
 * scenarios that nothing in the analysis supports.
 */
function Preview() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 h-3.5 w-1/3 rounded-full bg-slate-200" />
          <PreviewLines count={2} />
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
      title="Would You Survive…?"
      emoji="🧪"
      teaser="Moving in, distance, money, a life change, a child — all five, rated and explained."
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(scenarios) => (
        <div className="space-y-3">
          {scenarios.map((scenario) => {
            const badge = RISK_BADGE[scenario.risk];
            return (
              <div
                key={scenario.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-bold text-slate-900">
                    <span className="mr-1.5" aria-hidden>
                      {SCENARIO_EMOJI[scenario.id]}
                    </span>
                    {scenario.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full ${badge.chip} px-2.5 py-1 text-xs font-semibold ${badge.text}`}
                  >
                    <span aria-hidden className="mr-1">
                      {badge.emoji}
                    </span>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {scenario.analysis}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </PaidSection>
  );
}
