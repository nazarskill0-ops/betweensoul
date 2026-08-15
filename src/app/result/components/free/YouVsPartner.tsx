import { FREE_SLIDER_COUNT, Slider } from "@/lib/types";
import { SliderBar } from "../shared/SliderBar";
import { PaywallHook } from "../shared/PaywallHook";

/**
 * Position 6 — the comparison, and the most screenshot-friendly thing on the
 * page.
 *
 * A white card like every other section: the dark panel this used to sit on
 * made it the one block on the page that belonged to a different design. What
 * makes it hold together when it's cropped out and sent to a friend is the pair
 * of names at the top of the tracks, in the tracks' own two colours, and the
 * site name at the foot.
 *
 * Two of the five free, all five once the report is unlocked. It is the one
 * section where paying extends something the free half already showed rather
 * than opening a section that was shut — the five positions are all written in
 * the same free request, and the padlock is over how many of them are drawn.
 * That works here because the bars are directly comparable: three more of the
 * same thing is a legible offer in a way that "more paragraphs" would not be.
 */
export function YouVsPartner({
  sliders,
  locked,
  p1Name,
  p2Name,
}: {
  sliders: Slider[];
  locked: boolean;
  p1Name: string;
  p2Name: string;
}) {
  const shown = locked ? sliders.slice(0, FREE_SLIDER_COUNT) : sliders;
  const remaining = sliders.length - shown.length;

  return (
    <section className="report-card">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        ⚖️ {p1Name} vs {p2Name}
      </h2>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-[var(--color-p1)]">{p1Name}</span>
          <span className="text-[var(--color-p2)]">{p2Name}</span>
        </div>

        <div className="mt-4 space-y-5">
          {shown.map((slider) => (
            <SliderBar
              key={slider.question}
              question={slider.question}
              position={slider.partner1Position}
            />
          ))}
        </div>
      </div>

      {remaining > 0 ? (
        <PaywallHook
          question={`${remaining} more comparisons came out of your answers.`}
          cta={`🔒 See ${remaining} more comparisons`}
        />
      ) : (
        <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          couplescan.com
        </p>
      )}
    </section>
  );
}
