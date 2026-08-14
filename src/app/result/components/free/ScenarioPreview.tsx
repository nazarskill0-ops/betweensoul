import {
  FREE_SCENARIO_COUNT,
  ScenarioPreview as ScenarioPreviewData,
  ScenarioStatus,
} from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";
import { PaywallHook } from "../shared/PaywallHook";
import { SCENARIO_EMOJI } from "../shared/scale";

/**
 * Position 7 — three futures of five, one line each.
 *
 * All five are written; this shows the first three and keeps the last two shut.
 * The two that stay shut are named, because "and 2 more" is a weaker promise
 * than "and here is what we haven't told you about having a child" — the reader
 * has to be able to want the specific thing.
 */
const STATUS: Record<ScenarioStatus, { emoji: string; label: string }> = {
  good: { emoji: "🟢", label: "Handled well" },
  watch: { emoji: "⚠️", label: "Worth watching" },
  risk: { emoji: "🔴", label: "Pressure point" },
};

export function ScenarioPreview({
  scenarios,
  locked,
}: {
  scenarios: ScenarioPreviewData[];
  locked: boolean;
}) {
  const shown = locked ? scenarios.slice(0, FREE_SCENARIO_COUNT) : scenarios;
  const hidden = locked ? scenarios.slice(FREE_SCENARIO_COUNT) : [];

  return (
    <SectionCard title="What Happens If…" emoji="🔮">
      <div className="space-y-3">
        {shown.map((scenario) => (
          <div key={scenario.id}>
            <p className="text-[15px] font-semibold text-slate-900">
              <span className="mr-1.5" aria-hidden>
                {SCENARIO_EMOJI[scenario.id]}
              </span>
              {scenario.name}?
            </p>
            <p className="mt-1 flex gap-2 text-[15px] leading-relaxed text-slate-600">
              <span
                className="shrink-0"
                role="img"
                aria-label={STATUS[scenario.status].label}
              >
                {STATUS[scenario.status].emoji}
              </span>
              {scenario.teaser}
            </p>
          </div>
        ))}

        {hidden.map((scenario) => (
          <div key={scenario.id} className="flex items-center gap-2">
            <p className="flex-1 text-[15px] font-semibold text-slate-400">
              <span className="mr-1.5" aria-hidden>
                {SCENARIO_EMOJI[scenario.id]}
              </span>
              {scenario.name}?
            </p>
            <span className="text-sm" role="img" aria-label="Locked">
              🔒
            </span>
          </div>
        ))}
      </div>

      {locked && (
        <PaywallHook
          question="See what happens in all 5 scenarios."
          cta="🔒 Unlock all five futures"
        />
      )}
    </SectionCard>
  );
}
