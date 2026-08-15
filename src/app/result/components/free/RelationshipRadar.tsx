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
 * The top and bottom dimension are called out under the grid rather than
 * flagged inside their chips. A glyph tucked next to a number needs a legend to
 * decode it, and by the time anyone has read the legend they could have read
 * the sentence instead — so the sentence is what they get. The section below
 * this one says why those two are where they are, and deliberately does not
 * repeat their names or their scores.
 */
function Callout({
  emoji,
  label,
  name,
  score,
  tone,
}: {
  emoji: string;
  label: string;
  name: string;
  score: number;
  tone: "green" | "amber";
}) {
  const style =
    tone === "green"
      ? "bg-green-50 text-green-800"
      : "bg-amber-50 text-amber-800";

  return (
    <p className={`flex items-center gap-2 rounded-xl ${style} px-4 py-2.5`}>
      <span aria-hidden>{emoji}</span>
      <span className="text-[15px]">
        <span className="font-semibold">{label}:</span> {name}
      </span>
      <span className="ml-auto text-[15px] font-bold">{score}</span>
    </p>
  );
}

export function RelationshipRadar({ data }: { data: Radar }) {
  // Ties resolve to the first of them, which is the same rule the report uses
  // everywhere else the extremes are picked.
  const ranked = [...data.dimensions].sort((a, b) => b.score - a.score);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];

  return (
    <SectionCard title="Relationship Radar" emoji="📡">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.dimensions.map((dimension) => {
          const band = scoreBand(dimension.score);
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
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <Callout
          emoji="🔥"
          label="Strongest"
          name={highest.name}
          score={highest.score}
          tone="green"
        />
        <Callout
          emoji="⚠️"
          label="Watch"
          name={lowest.name}
          score={lowest.score}
          tone="amber"
        />
      </div>
    </SectionCard>
  );
}
