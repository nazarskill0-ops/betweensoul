import { CoupleDynamic as CoupleDynamicData } from "@/lib/types";

/**
 * Position 2 — the archetype, named. The second-most screenshotted thing.
 *
 * The name is the whole point of the section: it is what one of them types into
 * a group chat. What used to sit under it — the description, then what works,
 * then where it gets difficult — was three paragraphs explaining the couple to
 * themselves before they had been asked for anything. One paragraph is enough
 * to make the label land.
 */
export function CoupleDynamic({ data }: { data: CoupleDynamicData }) {
  return (
    <section className="report-card text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Your Couple Dynamic
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {data.name}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
        {data.description}
      </p>
    </section>
  );
}
