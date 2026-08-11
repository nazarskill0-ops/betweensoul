import { Slider } from "@/lib/types";
import { SliderBar } from "../shared/SliderBar";

/**
 * Position 7 — six comparisons, and the most screenshot-friendly thing on the
 * page.
 *
 * Given its own tinted panel rather than the standard white card so it reads as
 * a self-contained object when it's cropped out and sent to a friend. The
 * partner names sit at the top of the track, in the track's own two colours, so
 * a crop of this section still says who is who.
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
    <section className="rounded-2xl bg-slate-900 p-5 shadow-lg sm:p-7">
      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        ⚖️ {p1Name} vs {p2Name}
      </h2>

      <div className="mt-5 rounded-xl bg-white p-4 sm:p-5">
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

      <p className="mt-4 text-center text-xs text-slate-400">
        couplescan.com
      </p>
    </section>
  );
}
