import { UnsaidThings as UnsaidThingsData } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";

/**
 * Position 10 — two of three per partner, with the third behind the lock.
 *
 * The blurred third item is filler, not the withheld line: like every other
 * locked thing on this page, it isn't generated until the report is unlocked.
 */
function PartnerColumn({
  name,
  items,
  third,
  panel,
  label,
}: {
  name: string;
  items: string[];
  third: string | undefined;
  panel: string;
  label: string;
}) {
  return (
    <div className={`rounded-xl ${panel} p-4`}>
      <p className={`text-xs font-semibold ${label}`}>
        Things {name} may not say directly
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-white/70 p-3 text-[15px] leading-relaxed text-slate-700"
          >
            {item}
          </li>
        ))}
        {third ? (
          <li className="rounded-lg bg-white/70 p-3 text-[15px] leading-relaxed text-slate-700">
            {third}
          </li>
        ) : (
          <li className="relative rounded-lg bg-white/70 p-3">
            <span className="locked-preview block text-[15px] leading-relaxed text-slate-700">
              And the one they have never quite found the words for.
            </span>
            <span className="absolute right-2 top-2 text-xs" aria-label="Locked">
              🔒
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export function UnsaidThings({
  data,
  unlocked,
  p1Name,
  p2Name,
}: {
  data: UnsaidThingsData;
  /** The third item per partner, once the report is unlocked. */
  unlocked: { partner1: string; partner2: string } | undefined;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <SectionCard title="3 Things They May Not Say Directly" emoji="🤐">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Written out rather than interpolated: Tailwind only emits classes it
            can find as literal strings in the source. */}
        <PartnerColumn
          name={p1Name}
          items={data.partner1.shown}
          third={unlocked?.partner1}
          panel="bg-[var(--color-p1-soft)]"
          label="text-[var(--color-p1)]"
        />
        <PartnerColumn
          name={p2Name}
          items={data.partner2.shown}
          third={unlocked?.partner2}
          panel="bg-[var(--color-p2-soft)]"
          label="text-[var(--color-p2)]"
        />
      </div>
    </SectionCard>
  );
}
