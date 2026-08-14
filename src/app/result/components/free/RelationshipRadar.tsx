import { Radar } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";
import { DIMENSION_EMOJI, scoreBand } from "../shared/scale";

/**
 * Position 3 — eight scored dimensions, as chips.
 *
 * A spider chart was the obvious choice and the wrong one: at 375px, eight
 * labelled axes are unreadable. Eight scored rows each with a paragraph under
 * it was the next thing tried, and it was worse in a different way — it took
 * longer to read than the section was worth and left nothing to buy. The
 * insights are still written (the paid X-ray is built on them) but they are not
 * shown here.
 *
 * The strongest and weakest dimension carry a marker rather than a callout of
 * their own: the section immediately below this one names both of them again,
 * with a sentence each, and printing "Strongest: Trust — 88" directly above
 * "YOUR SUPERPOWER · Trust — 88" reads as a stutter.
 */
export function RelationshipRadar({ data }: { data: Radar }) {
  const scores = data.dimensions.map((dimension) => dimension.score);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  return (
    <SectionCard title="Relationship Radar" emoji="📡">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.dimensions.map((dimension) => {
          const band = scoreBand(dimension.score);
          // Ties resolve to the first match, which is why these are compared
          // against the extremes rather than against a sorted position: two
          // dimensions on 88 both deserve the flame.
          const marker =
            dimension.score === highest
              ? "🔥"
              : dimension.score === lowest
                ? "⚠️"
                : null;

          return (
            <div
              key={dimension.id}
              className={`rounded-xl ${band.chip} px-3 py-2.5 text-center`}
            >
              <p className="text-lg leading-none" aria-hidden>
                {DIMENSION_EMOJI[dimension.id]}
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-tight text-slate-600">
                {dimension.name}
              </p>
              <p className={`mt-0.5 text-lg font-bold ${band.text}`}>
                {dimension.score}
                {marker && (
                  <span className="ml-1 text-xs align-middle" aria-hidden>
                    {marker}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        🔥 strongest · ⚠️ worth watching
      </p>
    </SectionCard>
  );
}
