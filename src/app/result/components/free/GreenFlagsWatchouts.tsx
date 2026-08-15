import { Flags } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";

/**
 * Position 5 — the flags, as chips.
 *
 * Two bulleted columns read as a list to be worked through; chips read as a
 * verdict to be glanced at, which is what these are. Nothing explains them,
 * here or later — each line has to stand up on its own, and the prompt is
 * written to that.
 *
 * The watch-outs are amber and stop there. There is no red tier, on purpose:
 * the analysis prompts are forbidden from using the words "red flag" about a
 * fifteen-question quiz, and a chip that looks like an alarm makes the claim
 * the copy is careful not to.
 */
function Chip({ tone, children }: { tone: "green" | "amber"; children: string }) {
  const style =
    tone === "green"
      ? "bg-green-50 text-green-800 ring-green-600/10"
      : "bg-amber-50 text-amber-800 ring-amber-600/10";

  return (
    <li
      className={`inline-flex items-start gap-1.5 rounded-full ${style} px-3.5 py-1.5 text-sm font-medium ring-1`}
    >
      <span aria-hidden>{tone === "green" ? "🟢" : "🟡"}</span>
      {children}
    </li>
  );
}

export function GreenFlagsWatchouts({ data }: { data: Flags }) {
  return (
    <SectionCard title="Green Flags & Watch-outs" emoji="🚩">
      <ul className="flex flex-wrap gap-2">
        {data.greenFlags.map((flag) => (
          <Chip key={flag} tone="green">
            {flag}
          </Chip>
        ))}
        {data.watchOuts.map((item) => (
          <Chip key={item} tone="amber">
            {item}
          </Chip>
        ))}
      </ul>
    </SectionCard>
  );
}
