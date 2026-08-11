import { Slider } from "@/lib/types";
import { SliderBar } from "../shared/SliderBar";

/**
 * Position 7 — six comparisons, and the most screenshot-friendly thing on the
 * page.
 *
 * A white card like every other section: the dark panel this used to sit on
 * made it the one block on the page that belonged to a different design. What
 * makes it hold together when it's cropped out and sent to a friend is the pair
 * of names at the top of the tracks, in the tracks' own two colours, and the
 * site name at the foot.
 */
export function YouVsPartner({
  sliders,
  p1Name,
  p2Name,
}: {
  sliders: Slider[];
  p1Name: string;
  p2Name: string;
}) {
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
          {sliders.map((slider) => (
            <SliderBar
              key={slider.question}
              question={slider.question}
              position={slider.partner1Position}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
        couplescan.com
      </p>
    </section>
  );
}
