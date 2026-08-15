import { Highlight } from "@/lib/types";
import { SectionCard } from "../shared/SectionCard";
import { PaywallHook } from "../shared/PaywallHook";

/**
 * Position 4 — the best thing and the worst thing, one line each.
 *
 * These were two full sections with a paragraph and a "why this matters" panel
 * apiece. Side by side they do more work and take a fifth of the room: the good
 * news and the bad news land in the same glance, which is the comparison the
 * reader is making anyway.
 *
 * The division of labour with the radar above: the radar says WHICH dimensions
 * are top and bottom and what they scored; this says WHY, and nothing else.
 *
 * The hook at the bottom is the hinge of the whole page. Each half names a
 * pattern and stops before explaining it, and the X-ray that follows is the
 * explanation — which is why this is the first place the page asks for
 * anything.
 */
function Half({
  label,
  badge,
  data,
  tone,
}: {
  label: string;
  badge: string;
  data: Highlight;
  tone: "green" | "amber";
}) {
  const panel =
    tone === "green"
      ? "bg-green-50/70 ring-green-500/10"
      : "bg-amber-50/70 ring-amber-500/10";
  const labelColor = tone === "green" ? "text-green-700" : "text-amber-700";

  return (
    <div className={`rounded-xl ${panel} p-4 ring-1`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
        {badge} {label}
      </p>
      {/* No dimension name and no score. The radar directly above prints both,
          in a callout that names the same two dimensions — repeating them here
          spends the section's only two sentences on a label the reader read
          four seconds ago. What is left is the part the radar cannot show. */}
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
        {data.explanation}
      </p>
    </div>
  );
}

export function SuperpowerPressurePoint({
  strength,
  tension,
  locked,
}: {
  strength: Highlight;
  tension: Highlight;
  locked: boolean;
}) {
  return (
    <SectionCard title="Your Superpower & Pressure Point" emoji="⚡">
      <div className="grid gap-3 sm:grid-cols-2">
        <Half label="Your superpower" badge="💗" data={strength} tone="green" />
        <Half label="Your pressure point" badge="⚡" data={tension} tone="amber" />
      </div>

      {/* A buyer has the X-ray directly below this; asking them again to buy
          what they have already bought is how a paid report starts feeling
          like a trial. */}
      {locked && (
        <PaywallHook
          question="Want to know why this pattern keeps showing up?"
          cta="🔒 Unlock Full Analysis"
        />
      )}
    </SectionCard>
  );
}
