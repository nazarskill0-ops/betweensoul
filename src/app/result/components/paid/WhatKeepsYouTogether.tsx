import { WhatKeepsYouTogether as WhatKeepsYouTogetherData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/** Position 18 — the anchors, and whether they hold. */
function Preview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", "", ""].map((_, i) => (
          <span key={i} className="h-7 w-28 rounded-full bg-slate-200" />
        ))}
      </div>
      <PreviewLines count={3} />
    </div>
  );
}

export function WhatKeepsYouTogether({
  id,
  data,
  generating,
}: {
  id?: string;
  data: WhatKeepsYouTogetherData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      id={id}
      title="What Keeps You Together (And Is It Enough?)"
      emoji="💚"
      teaser="We identified your relationship's strongest anchors. The question is whether they're enough."
      data={data}
      generating={generating}
      preview={<Preview />}
    >
      {(keep) => (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {keep.anchors.map((anchor) => (
              <span
                key={anchor}
                className="rounded-full bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-700"
              >
                {anchor}
              </span>
            ))}
          </div>
          <Insight label="The evidence" tone="green">
            <Prose text={keep.evidence} />
          </Insight>
          <Insight label="Is it enough?">
            <Prose text={keep.isItEnough} />
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
