import { HowYouSeeEachOther as HowYouSeeEachOtherData } from "@/lib/types";
import { Insight } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 5 — the two mirrors, and the thing neither of them can see.
 *
 * Short lines rather than paragraphs, because this is a list of impressions and
 * that is how impressions arrive. The two panels face each other in the
 * partners' own colours; the surprise sits underneath both, where it belongs —
 * it is about the pair, not about either of them.
 */
function Mirror({
  heading,
  lines,
  first,
}: {
  heading: string;
  lines: string[];
  first: boolean;
}) {
  const panel = first ? "bg-[var(--color-p1-soft)]" : "bg-[var(--color-p2-soft)]";
  const label = first ? "text-[var(--color-p1)]" : "text-[var(--color-p2)]";

  return (
    <div className={`rounded-xl ${panel} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${label}`}>
        {heading}
      </p>
      <ul className="mt-2.5 space-y-2">
        {lines.map((line) => (
          <li key={line} className="flex gap-2 text-[15px] leading-relaxed text-slate-700">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowYouSeeEachOther({
  id,
  data,
  generating,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: HowYouSeeEachOtherData | null | undefined;
  generating: boolean;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="howYouSeeEachOther"
      id={id}
      title="How You Really See Each Other"
      emoji="👀"
      teaser="What each of you would say about the other if they weren't in the room — and the part neither of you has noticed."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl bg-white p-4">
                <PreviewLines count={3} />
              </div>
            ))}
          </div>
          <PreviewLines count={2} />
        </div>
      }
    >
      {(mirrors) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Mirror
              first
              heading={`How ${p1Name} sees ${p2Name}`}
              lines={mirrors.partner1SeesPartner2}
            />
            <Mirror
              first={false}
              heading={`How ${p2Name} sees ${p1Name}`}
              lines={mirrors.partner2SeesPartner1}
            />
          </div>

          <Insight label="The surprise" tone="blue">
            <p className="text-[15px] leading-relaxed text-slate-600">
              {mirrors.surprise}
            </p>
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
