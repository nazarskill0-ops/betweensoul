import { IfNothingChanges as IfNothingChangesData } from "@/lib/types";
import { PaidSection, PreviewLines } from "../shared/LockedSection";
import { RISK_BADGE } from "../shared/scale";

/**
 * Paid 7 — six months, twelve months, and the way out.
 *
 * A timeline, because the claim being made is about sequence: the thing that is
 * true at six months is what makes the twelve-month picture different, and two
 * paragraphs side by side lose that. The turning point breaks the rail on
 * purpose — it is the one entry that is not a prediction.
 *
 * The strain badge is where a competitor would print "37% chance of breaking
 * up". There is no model behind a number like that, and there is no number
 * here: see IfNothingChanges in types.ts.
 */
function Stop({
  marker,
  label,
  text,
  last = false,
}: {
  marker: string;
  label: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center" aria-hidden>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
          {marker}
        </span>
        {!last && <span className="w-px flex-1 bg-slate-200" />}
      </div>
      <div className={last ? "" : "pb-5"}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export function IfNothingChanges({
  id,
  data,
  generating,
}: {
  id?: string;
  data: IfNothingChangesData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      sectionId="ifNothingChanges"
      id={id}
      title="If Nothing Changes…"
      emoji="⏳"
      teaser="Where the current pattern leads at six months and at twelve — and the one thing that would change the direction."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-4">
          <PreviewLines count={2} />
          <PreviewLines count={2} />
          <PreviewLines count={2} />
        </div>
      }
    >
      {(future) => {
        const badge = RISK_BADGE[future.strain];
        return (
          <div>
            <p className="mb-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full ${badge.chip} px-3 py-1 text-xs font-semibold ${badge.text}`}
              >
                <span aria-hidden>{badge.emoji}</span>
                Strain on the relationship: {future.strain}
              </span>
            </p>

            <Stop marker="📅" label="6 months" text={future.sixMonths} />
            <Stop marker="📅" label="12 months" text={future.twelveMonths} />
            <Stop
              marker="⚡"
              label="The turning point"
              text={future.turningPoint}
              last
            />
          </div>
        );
      }}
    </PaidSection>
  );
}
