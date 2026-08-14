import { UnsaidThings as UnsaidThingsData } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";
import { PaywallHook } from "../shared/PaywallHook";

/**
 * Position 9 — one of three, with two behind the lock.
 *
 * This used to show two per partner and lock a third each, which gave away four
 * of the six most personal lines in the report — the section people actually
 * pay for, half-spent before the ask. One is revealed now, and the prompt is
 * told to make it the least raw of the three.
 *
 * The two blurred rows are filler, as everywhere else on this page: the real
 * lines are not generated until the report is unlocked, so there is nothing
 * here to recover by removing the blur.
 */
function LockedRow({ teaser }: { teaser: string }) {
  return (
    <li className="relative rounded-xl bg-slate-50 p-4">
      <span className="locked-preview block text-[15px] leading-relaxed text-slate-700">
        {teaser}
      </span>
      <span className="absolute right-3 top-3 text-xs" role="img" aria-label="Locked">
        🔒
      </span>
    </li>
  );
}

export function UnsaidThings({
  data,
  locked,
  p1Name,
  p2Name,
}: {
  data: UnsaidThingsData;
  locked: boolean;
  p1Name: string;
  p2Name: string;
}) {
  const aboutP1 = data.about === "partner1";

  return (
    <SectionCard title="3 Things They May Not Say Directly" emoji="🤐">
      <ul className="space-y-3">
        <li
          className={`rounded-xl p-4 ${
            aboutP1
              ? "bg-[var(--color-p1-soft)]"
              : "bg-[var(--color-p2-soft)]"
          }`}
        >
          <p
            className={`text-xs font-semibold ${
              aboutP1 ? "text-[var(--color-p1)]" : "text-[var(--color-p2)]"
            }`}
          >
            About {aboutP1 ? p1Name : p2Name}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
            {data.shown}
          </p>
        </li>

        {/* Once the report is unlocked the other two are not shown here: the
            paid section of the same name carries all three, each with the
            reason it goes unsaid, and printing two of them twice on one page
            would make the paid card read as a repeat of this one. */}
        {locked && (
          <>
            <LockedRow teaser={data.lockedTeaser} />
            <LockedRow teaser="And the one neither of you has quite found the words for." />
          </>
        )}
      </ul>

      {locked && (
        <PaywallHook
          question="Two more came out of your answers — one about each of you."
          cta="🔒 See all 3 things"
        />
      )}
    </SectionCard>
  );
}
