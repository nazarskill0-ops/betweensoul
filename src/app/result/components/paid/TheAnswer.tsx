import { TheAnswer as TheAnswerData } from "@/lib/types";
import { Insight, Prose } from "../shared/SectionCard";
import { PaidSection, PreviewLines } from "../shared/LockedSection";

/**
 * Position 21 — the finale, and the target of the link under The Question.
 *
 * Its id is fixed so that link keeps working whether the section is locked or
 * unlocked; a reader who clicks through and lands on the padlock is exactly the
 * reader the section is for.
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
      id={id}
      title="The Answer"
      emoji="🕯️"
      teaser="Our honest assessment of where your relationship stands — and three conversations that could change everything."
      data={data}
      generating={generating}
      preview={
        <div className="space-y-4">
          <PreviewLines count={4} />
          <PreviewLines count={2} />
        </div>
      }
    >
      {(answer) => (
        <div className="space-y-4">
          <Prose text={answer.synthesis} />
          <Insight label="Talk about this tonight" tone="blue">
            <p className="text-base font-semibold leading-snug text-slate-900">
              &ldquo;{answer.questionToDiscussTonight}&rdquo;
            </p>
          </Insight>
          <ul className="space-y-2">
            {answer.conversationStarters.map((starter) => (
              <li
                key={starter}
                className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] text-slate-700"
              >
                &ldquo;{starter}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </PaidSection>
  );
}
