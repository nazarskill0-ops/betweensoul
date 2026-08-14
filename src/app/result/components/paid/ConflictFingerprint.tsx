import { ConflictFingerprint as ConflictFingerprintData } from "@/lib/types";
import { PaidSection } from "../shared/LockedSection";

/**
 * Paid 3 — the fight, drawn as the loop it is.
 *
 * A vertical flow rather than six labelled paragraphs: the connecting rail down
 * the left is what turns a list of bad moments into a cycle, and the last step
 * closes back to the first, which is the observation the whole section exists
 * to make. Read top to bottom it should produce "that is literally what happens
 * every time" — so each step is one or two sentences and never more.
 *
 * The stage names stay sharp while their text blurs in the locked preview. The
 * shape of the loop is the hook; seeing trigger → reaction → escalation spelled
 * out is what makes someone want the sentences under it.
 */
const STEPS = [
  { key: "trigger", label: "Trigger", emoji: "⚡" },
  { key: "reaction", label: "Reaction", emoji: "💬" },
  { key: "escalation", label: "Escalation", emoji: "🌩️" },
  { key: "withdrawal", label: "Withdrawal", emoji: "🚪" },
  { key: "aftermath", label: "Aftermath", emoji: "🌅" },
  { key: "repeat", label: "Repeat", emoji: "🔁" },
] as const;

function Row({
  emoji,
  label,
  last,
  children,
}: {
  emoji: string;
  label: string;
  last: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {/* The rail: a dot per step and a line joining it to the next one. */}
      <div className="flex flex-col items-center" aria-hidden>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
          {emoji}
        </span>
        {!last && <span className="w-px flex-1 bg-slate-200" />}
      </div>
      <div className={last ? "" : "pb-5"}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function Preview() {
  return (
    <div>
      {STEPS.map((step, i) => (
        <Row
          key={step.key}
          emoji={step.emoji}
          label={step.label}
          last={i === STEPS.length - 1}
        >
          <div className="locked-preview space-y-2 pt-1">
            <div className="h-3 w-64 max-w-full rounded-full bg-slate-200" />
            <div className="h-3 w-48 max-w-full rounded-full bg-slate-200" />
          </div>
        </Row>
      ))}
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
      sectionId="conflictFingerprint"
      id={id}
      title="Your Conflict Fingerprint"
      emoji="🧬"
      teaser="The same argument, stage by stage — what starts it, who leaves first, and why it comes back."
      data={data}
      generating={generating}
      preview={<Preview />}
      blurPreview={false}
    >
      {(cycle) => (
        <div>
          {STEPS.map((step, i) => (
            <Row
              key={step.key}
              emoji={step.emoji}
              label={step.label}
              last={i === STEPS.length - 1}
            >
              <p className="text-[15px] leading-relaxed text-slate-600">
                {cycle[step.key]}
              </p>
            </Row>
          ))}
        </div>
      )}
    </PaidSection>
  );
}
