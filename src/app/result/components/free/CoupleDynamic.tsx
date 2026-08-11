import { CoupleDynamic as CoupleDynamicData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";

/** Position 2 — the archetype, named. The second-most screenshotted thing. */
export function CoupleDynamic({ data }: { data: CoupleDynamicData }) {
  return (
    <section className="report-card">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
        Your Couple Dynamic
      </p>
      <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {data.name}
      </h2>

      <div className="mt-5">
        <Prose text={data.description} />
      </div>

      <div className="mt-4 space-y-3">
        <Insight label="💚 What makes this work" tone="green">
          <Prose text={data.whatWorks} />
        </Insight>
        <Insight label="⚡ Where it gets difficult" tone="amber">
          <Prose text={data.whereItGetsDifficult} />
        </Insight>
      </div>
    </section>
  );
}
