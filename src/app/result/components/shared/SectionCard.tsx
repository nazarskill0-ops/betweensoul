import { ReactNode } from "react";

/**
 * The white card every section sits in.
 *
 * `accent` paints a thin bar down the left edge — used by the two sections that
 * carry a verdict (strength, tension) so the reader can tell good news from
 * bad before reading a word.
 */
export function SectionCard({
  id,
  title,
  emoji,
  accent = "none",
  action,
  children,
}: {
  id?: string;
  title?: string;
  emoji?: string;
  accent?: "none" | "green" | "amber";
  /** Rendered at the right of the heading — the lock badge, usually. */
  action?: ReactNode;
  children: ReactNode;
}) {
  const accentClass = {
    none: "",
    green: "border-l-4 border-l-green-500",
    amber: "border-l-4 border-l-amber-500",
  }[accent];

  return (
    <section id={id} className={`report-card ${accentClass} scroll-mt-6`}>
      {title && (
        <div className="mb-4 flex items-start gap-2">
          <h2 className="flex-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Body copy from the model. Splits on blank lines so paragraphs survive. */
export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="text-[15px] leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
    </div>
  );
}

/**
 * The model's read on the couple, as opposed to the structure around it.
 *
 * Given its own tinted panel throughout the report so the reader can tell at a
 * glance which words are analysis and which are furniture.
 */
export function Insight({
  label,
  tone = "slate",
  children,
}: {
  label?: string;
  tone?: "slate" | "green" | "amber" | "blue";
  children: ReactNode;
}) {
  const [bg, text] = {
    slate: "bg-slate-50 text-slate-500",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  }[tone].split(" ");

  return (
    <div className={`rounded-xl ${bg} p-4`}>
      {label && (
        <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${text}`}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

/** Side-by-side partner panels, coloured by partner order rather than gender. */
export function PartnerSplit({
  p1Label,
  p2Label,
  p1Text,
  p2Text,
}: {
  p1Label: string;
  p2Label: string;
  p1Text: string;
  p2Text: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-[var(--color-p1-soft)] p-4">
        <p className="text-xs font-semibold text-[var(--color-p1)]">{p1Label}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{p1Text}</p>
      </div>
      <div className="rounded-xl bg-[var(--color-p2-soft)] p-4">
        <p className="text-xs font-semibold text-[var(--color-p2)]">{p2Label}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{p2Text}</p>
      </div>
    </div>
  );
}
