import { Question, SCALE_POINTS, questions } from "@/lib/questions";
import { AnswerValue } from "@/lib/types";

/**
 * How each answer type is stored in the store's answer map:
 *
 *   text          "q1"        -> [p1 text, p2 text]
 *   choice        "q3"        -> [p1 choice id, p2 choice id]  (or "id" when together)
 *   multi-select  "q4"        -> ["a,c,f", "b,f"]  — comma-joined choice ids
 *   blitz         "q6_b1"     -> ["fine", "dealbreaker"]
 *   scale         "q7_s1"     -> ["3", "6"]  — 1..SCALE_POINTS
 *
 * This file is the only place that turns those raw values back into English,
 * so the model quotes what the couple actually picked rather than an id.
 */

const BLITZ_LABELS: Record<string, string> = {
  fine: "Totally Fine",
  dealbreaker: "DEALBREAKER",
};

function choiceText(question: Question, id: string): string {
  const choice = question.choices?.find((c) => c.id === id);
  return choice ? choice.text : id;
}

function multiSelectText(question: Question, raw: string): string {
  const ids = raw.split(",").filter(Boolean);
  if (!ids.length) return "nothing selected";
  return ids.map((id) => choiceText(question, id)).join("; ");
}

/** "3/7 (leans: Career first)" — position alone means nothing without the poles. */
function scaleText(left: string, right: string, raw: string): string {
  const position = Number(raw);
  if (!Number.isFinite(position)) return raw;

  const middle = (SCALE_POINTS + 1) / 2;
  const lean =
    position < middle
      ? `leans "${left}"`
      : position > middle
        ? `leans "${right}"`
        : "dead centre";

  return `${position}/${SCALE_POINTS} — ${lean}`;
}

/** Who the answer is about, so the model doesn't misread a cross question. */
function speaker(question: Question, name: string, otherName: string): string {
  return question.answeredBy === "cross" ? `${name} about ${otherName}` : name;
}

/**
 * Flattens the store's answer map into a readable transcript for the model.
 * Answers are `[p1, p2]` when each partner answered, or a bare string when
 * they answered together.
 */
export function buildTranscript(
  answers: Record<string, AnswerValue>,
  p1Name: string,
  p2Name: string,
): string {
  const lines: string[] = [];

  for (const question of questions) {
    const p1Label = speaker(question, p1Name, p2Name);
    const p2Label = speaker(question, p2Name, p1Name);

    // Blitz and scale store one entry per sub-item.
    if (question.type === "blitz" && question.blitzItems) {
      const rows = question.blitzItems
        .map((item) => {
          const value = answers[`${question.id}_${item.id}`];
          if (!value) return null;
          const render = (raw: string) => BLITZ_LABELS[raw] ?? raw;
          return Array.isArray(value)
            ? `  - "${item.statement}" — ${p1Label}: ${render(value[0])} | ${p2Label}: ${render(value[1])}`
            : `  - "${item.statement}" — both: ${render(value)}`;
        })
        .filter(Boolean) as string[];

      if (rows.length) {
        lines.push(`Q (${question.id}, gut-check round): ${question.text}`);
        lines.push(...rows);
        lines.push("");
      }
      continue;
    }

    if (question.type === "scale" && question.scaleItems) {
      const rows = question.scaleItems
        .map((item) => {
          const value = answers[`${question.id}_${item.id}`];
          if (!value) return null;
          const poles = `"${item.left}" (1) ←→ "${item.right}" (${SCALE_POINTS})`;
          const render = (raw: string) => scaleText(item.left, item.right, raw);
          return Array.isArray(value)
            ? `  - ${poles} — ${p1Label}: ${render(value[0])} | ${p2Label}: ${render(value[1])}`
            : `  - ${poles} — both: ${render(value)}`;
        })
        .filter(Boolean) as string[];

      if (rows.length) {
        lines.push(
          `Q (${question.id}, ${SCALE_POINTS}-point scale — a wide gap between them is the interesting part): ${question.text}`,
        );
        lines.push(...rows);
        lines.push("");
      }
      continue;
    }

    const value = answers[question.id];
    if (value === undefined) continue;

    const render = (raw: string) => {
      if (question.type === "multi-select") return multiSelectText(question, raw);
      if (question.type === "choice") return choiceText(question, raw);
      return raw; // free text — quoted verbatim
    };

    const note =
      question.answeredBy === "cross" ? " — each answered about the other" : "";
    lines.push(`Q (${question.id}${note}): ${question.text}`);

    if (Array.isArray(value)) {
      lines.push(`  ${p1Label}: ${render(value[0])}`);
      lines.push(`  ${p2Label}: ${render(value[1])}`);
    } else {
      lines.push(`  Both together: ${render(value)}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

/** Rough relationship length from the "YYYY-MM" month input. */
export function describeRelationshipLength(start: string): string {
  if (!start) return "unknown";
  const [year, month] = start.split("-").map(Number);
  if (!year || !month) return "unknown";
  const months =
    (new Date().getFullYear() - year) * 12 + (new Date().getMonth() + 1 - month);
  if (months < 0) return "unknown";
  if (months < 12) return `${months} month(s)`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} year(s), ${rest} month(s)` : `${years} year(s)`;
}

export function describeAge(birthday: string): string {
  if (!birthday) return "unknown age";
  const born = new Date(birthday);
  if (Number.isNaN(born.getTime())) return "unknown age";
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) age--;
  return age >= 0 && age < 120 ? `${age}` : "unknown age";
}
