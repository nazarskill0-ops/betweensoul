import { ConflictFingerprint as ConflictFingerprintData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection } from "../shared/LockedSection";

/**
 * Position 11 — the fight cycle.
 *
 * The five stage names stay sharp while their descriptions blur: the shape of
 * the loop is the hook, and seeing "escalation → withdrawal → aftermath →
 * repeat" spelled out is what makes someone want the sentences under it.
 */
const STAGES = [
  { key: "trigger", label: "Trigger" },
  { key: "reaction", label: "Reaction" },
  { key: "escalation", label: "Escalation" },
  { key: "withdrawal", label: "Withdrawal" },
  { key: "aftermath", label: "Aftermath" },
] as const;

function CycleChain() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STAGES.map((stage, i) => (
        <span key={stage.key} className="flex items-center gap-1.5">
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            {stage.label}
          </span>
          <span className="text-slate-300" aria-hidden>
            →
          </span>
          {i === STAGES.length - 1 && (
            <span className="text-xs font-medium text-slate-400">repeat</span>
          )}
        </span>
      ))}
    </div>
  );
}

function Preview() {
  return (
    <div className="space-y-4">
      <CycleChain />
      <div className="locked-preview space-y-3">
        {STAGES.map((stage) => (
          <div key={stage.key} className="rounded-xl bg-white p-3">
            <div className="mb-2 h-3 w-1/4 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-200" />
              <div className="h-3 w-4/5 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConflictFingerprint({
  id,
  data,
  generating,
}: {
  id?: string;
  data: ConflictFingerprintData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      id={id}
      title="Your Conflict Fingerprint"
      emoji="🧬"
      teaser="See exactly how your arguments unfold, stage by stage — and why the same one keeps coming back."
      data={data}
      generating={generating}
      preview={<Preview />}
      blurPreview={false}
    >
      {(cycle) => (
        <div className="space-y-3">
          <CycleChain />
          {STAGES.map((stage) => (
            <Insight key={stage.key} label={stage.label}>
              <Prose text={cycle[stage.key]} />
            </Insight>
          ))}
          <Insight label="The pattern" tone="blue">
            <Prose text={cycle.pattern} />
          </Insight>
          <Insight label="What's underneath it" tone="green">
            <Prose text={cycle.insight} />
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
