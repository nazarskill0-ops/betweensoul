import { SevenDayReset as SevenDayResetData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Position 20 — the only section that asks them to do something.
 *
 * Day headings stay sharp: "one question, one thing to try, one date" is a
 * concrete promise, and it reads as one even before the content arrives.
 */
const DAYS = [
  { key: "day1Question", label: "Day 1 — The Question" },
  { key: "day2Action", label: "Day 2 — The Action" },
  { key: "day3Date", label: "Day 3 — The Date" },
] as const;

function Preview() {
  return (
    <div className="space-y-3">
      {DAYS.map((day) => (
        <div key={day.key} className="rounded-xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {day.label}
          </p>
          <div className="locked-preview mt-2.5">
            <PreviewLines count={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SevenDayReset({
  id,
  data,
  generating,
}: {
  id?: string;
  data: SevenDayResetData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      id={id}
      title="Your 7-Day Relationship Reset"
      emoji="🗓️"
      teaser="A personalized plan: one question to ask, one thing to try, and one date to go on — built around your specific patterns."
      data={data}
      generating={generating}
      preview={<Preview />}
      blurPreview={false}
    >
      {(reset) => (
        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <Insight
              key={day.key}
              label={day.label}
              tone={(["blue", "amber", "green"] as const)[i]}
            >
              <Prose text={reset[day.key]} />
            </Insight>
          ))}
          <Prose text={reset.whyThisWorks} />
        </div>
      )}
    </PaidSection>
  );
}
