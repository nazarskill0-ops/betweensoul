import { CoupleScore as CoupleScoreData } from "@/lib/types";
import { MetricDial, ScoreRing } from "../shared/ScoreBar";
import { scoreBand } from "../shared/scale";

/**
 * Position 1 — the first thing anyone sees, and the thing they screenshot.
 *
 * Everything else on the page is reading; this is one number, one line, and
 * three dials. It gets the most vertical space of any section for that reason.
 */
export function CoupleScore({
  data,
  p1Name,
  p2Name,
}: {
  data: CoupleScoreData;
  p1Name: string;
  p2Name: string;
}) {
  const band = scoreBand(data.overall);

  return (
    <section className="report-card text-center">
      <p className="text-sm font-medium text-slate-500">
        {p1Name} &amp; {p2Name}
      </p>

      <div className="mt-5">
        <ScoreRing score={data.overall} />
      </div>

      <span
        className={`mt-4 inline-block rounded-full px-3.5 py-1 text-sm font-semibold ${band.chip} ${band.text}`}
      >
        {band.label}
      </span>

      <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6">
        <MetricDial label="Connection" score={data.connection} />
        <MetricDial label="Stability" score={data.stability} />
        <MetricDial label="Chemistry" score={data.chemistry} />
      </div>

      <p className="mt-6 text-left text-[15px] leading-relaxed text-slate-600">
        {data.insight}
      </p>
    </section>
  );
}
