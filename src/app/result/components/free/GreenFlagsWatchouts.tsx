import { Flags } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";

/**
 * Position 13 — the flags.
 *
 * The watch-outs get the same visual weight as the green flags, not a warning
 * treatment: they are patterns to notice, and the report says so in as many
 * words. Styling them as alarms would contradict the copy.
 */
export function GreenFlagsWatchouts({ data }: { data: Flags }) {
  return (
    <SectionCard title="Green Flags & Watch-outs" emoji="🚩">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            Green flags
          </p>
          <ul className="mt-3 space-y-2">
            {data.greenFlags.map((flag) => (
              <li key={flag} className="flex gap-2.5 text-[15px] text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Worth watching
          </p>
          <ul className="mt-3 space-y-2">
            {data.watchOuts.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
