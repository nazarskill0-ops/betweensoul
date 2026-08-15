import { UnsaidThingFull } from "@/lib/types";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 1 — all three things, each with the reason it stays unsaid.
 *
 * This opens the paid half because it is the section the free page spends the
 * most effort promising: one of three shown, two blurred, a padlock reading
 * "See all 3 things". Putting the payoff anywhere else makes the buyer hunt for
 * the thing they just bought.
 *
 * One card each rather than a list, because these are three separate
 * observations about two different people — a bulleted run of them reads as one
 * verdict delivered in three parts.
 *
 * The first card is the one the free page already revealed, which the prompt
 * requires and the section is sold on ("all 3"). Left unmarked it reads as the
 * buyer's money going on something they had five minutes ago, so it is labelled
 * as already seen and the other two are labelled new — the value in card one is
 * the "why this matters" underneath it, which is genuinely new, and saying so
 * out loud costs less than hoping nobody notices.
 */
function Preview() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="mb-3 h-3 w-1/4 rounded-full bg-slate-200" />
          <PreviewLines count={2} />
        </div>
      ))}
    </div>
  );
}

export function UnsaidThingsPaid({
  id,
  data,
  generating,
  p1Name,
  p2Name,
}: {
  id?: string;
  data: UnsaidThingFull[] | null | undefined;
  generating: boolean;
  p1Name: string;
  p2Name: string;
}) {
  return (
    <PaidSection
      sectionId="unsaidThings"
      id={id}
      title="Things They'd Never Say To Your Face"
      emoji="🙊"
      teaser="All three of them, and why each one stays unsaid — including the one you've already seen."
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(things) => (
        <div className="space-y-3">
          {things.map((item, i) => {
            const aboutP1 = item.about === "partner1";
            // Index 0 is the previewed one by contract with the prompt, which
            // is told to lead with the line the free page already showed.
            const previewed = i === 0;
            return (
              <div
                key={i}
                className={`rounded-xl p-4 ${
                  aboutP1
                    ? "bg-[var(--color-p1-soft)]"
                    : "bg-[var(--color-p2-soft)]"
                } ${previewed ? "opacity-90" : "ring-1 ring-accent-200"}`}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={`flex-1 text-xs font-semibold uppercase tracking-wide ${
                      aboutP1
                        ? "text-[var(--color-p1)]"
                        : "text-[var(--color-p2)]"
                    }`}
                  >
                    About {aboutP1 ? p1Name : p2Name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      previewed
                        ? "bg-white/70 text-slate-400"
                        : "bg-accent-500 text-white"
                    }`}
                  >
                    {previewed ? "Already seen" : "New"}
                  </span>
                </div>
                <p className="mt-2 text-[15px] font-bold leading-relaxed text-slate-900">
                  {item.thing}
                </p>
                <div className="mt-3 rounded-lg bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Why this matters
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                    {item.whyThisMatters}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PaidSection>
  );
}
