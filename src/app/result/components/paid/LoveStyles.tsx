import { LoveStyles as LoveStylesData } from "@/lib/types";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 4 — what each of them gives against what each of them wants.
 *
 * One panel per partner, in that partner's colour, with the give and the want
 * stacked so the distance between them is read vertically — and then named, in
 * one line, at the foot of the panel. That last line is the section: the two
 * descriptions above it are only there to make it land.
 */
function PartnerPanel({
  name,
  shows,
  feelsLovedBy,
  gap,
  first,
}: {
  name: string;
  shows: string;
  feelsLovedBy: string;
  gap: string;
  first: boolean;
}) {
  const panel = first ? "bg-[var(--color-p1-soft)]" : "bg-[var(--color-p2-soft)]";
  const label = first ? "text-[var(--color-p1)]" : "text-[var(--color-p2)]";

  return (
    <div className={`rounded-xl ${panel} p-4`}>
      <p className={`text-sm font-bold ${label}`}>{name}</p>

      <dl className="mt-3 space-y-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shows love by
          </dt>
          <dd className="mt-0.5 text-[15px] leading-relaxed text-slate-700">
            {shows}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Feels loved when
          </dt>
          <dd className="mt-0.5 text-[15px] leading-relaxed text-slate-700">
            {feelsLovedBy}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-white/70 p-3 text-[15px] leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-900">The gap: </span>
        {gap}
      </p>
    </div>
  );
}

export function LoveStyles({
  id,
  data,
  generating,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: LoveStylesData | null | undefined;
  generating: boolean;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="loveStyles"
      id={id}
      title="How You Show Love vs How You Feel Loved"
      emoji="💞"
      teaser="What each of you gives, what each of you actually wants, and the distance between the two."
      data={data}
      generating={generating}
      preview={
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl bg-white p-4">
              <PreviewLines count={4} />
            </div>
          ))}
        </div>
      }
    >
      {(styles) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <PartnerPanel
            first
            name={p1Name}
            shows={styles.partner1Shows}
            feelsLovedBy={styles.partner1FeelsLovedBy}
            gap={styles.partner1Gap}
          />
          <PartnerPanel
            first={false}
            name={p2Name}
            shows={styles.partner2Shows}
            feelsLovedBy={styles.partner2FeelsLovedBy}
            gap={styles.partner2Gap}
          />
        </div>
      )}
    </PaidSection>
  );
}
