import { TheAnswer as TheAnswerData } from "@/lib/types";
import { Insight } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Paid 9 — the finale, and the last thing anyone reads.
 *
 * The question is printed as the heading of the section's body and the verdict
 * answers it in the first three words, because a reader who has scrolled a
 * whole report deserves the answer before the reasoning. Everything after it
 * points forward: the opportunity, then the sentence they could actually say
 * tonight, which is where the report ends.
 *
 * The id is fixed so anything linking to `#the-answer` keeps working whether
 * the section is locked or unlocked.
 */
export function TheAnswer({
  id = "the-answer",
  data,
  generating,
}: {
  id?: string;
  data: TheAnswerData | null | undefined;
  generating: boolean;
}) {
  return (
    <PaidSection
      sectionId="theAnswer"
      id={id}
      title="The Answer"
      emoji="🕯️"
      teaser="Whether you're actually a good match, said plainly — and the one conversation to have about it."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-4">
          <PreviewLines count={3} />
          <PreviewLines count={2} />
        </div>
      }
    >
      {(answer) => (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              So… are you actually a good match?
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-accent-500">
              {answer.shortAnswer}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              {answer.verdict}
            </p>
          </div>

          <div>
            <p className="text-base font-bold text-slate-900">
              Your biggest opportunity
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
              {answer.biggestOpportunity}
            </p>
          </div>

          <Insight label="The conversation to have" tone="blue">
            <p className="text-[15px] leading-relaxed text-slate-700">
              {answer.conversationToHave}
            </p>
          </Insight>
        </div>
      )}
    </PaidSection>
  );
}
