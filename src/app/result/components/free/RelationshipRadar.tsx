import { Radar } from "@/lib/types";
import { ScoreBar } from "../shared/ScoreBar";
import { Insight, Prose, SectionCard } from "../shared/SectionCard";
import { DIMENSION_EMOJI, scoreBand } from "../shared/scale";

/**
 * Position 3 — eight scored dimensions.
 *
 * A spider chart was the obvious choice and the wrong one: at 375px, eight
 * labelled axes are unreadable, and the insight under each dimension is the
 * part worth reading. The shape of the relationship still comes through in the
 * strip of colour above the list, which scans in about a second.
 */
export function RelationshipRadar({ data }: { data: Radar }) {
  return (
    <SectionCard title="Relationship Radar" emoji="📡">
      {/* Eight bands at a glance, before any reading. */}
      <div className="mb-6 flex gap-1" aria-hidden>
        {data.dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className={`h-1.5 flex-1 rounded-full ${scoreBand(dimension.score).bar}`}
            style={{ opacity: 0.35 + (dimension.score / 100) * 0.65 }}
          />
        ))}
      </div>

      <div className="space-y-6">
        {data.dimensions.map((dimension) => (
          <ScoreBar
            key={dimension.id}
            name={dimension.name}
            emoji={DIMENSION_EMOJI[dimension.id]}
            score={dimension.score}
          >
            <p className="text-[15px] leading-relaxed text-slate-600">
              {dimension.insight}
            </p>
          </ScoreBar>
        ))}
      </div>

      <div className="mt-6">
        <Insight label="How these connect" tone="blue">
          <Prose text={data.interconnection} />
        </Insight>
      </div>
    </SectionCard>
  );
}
