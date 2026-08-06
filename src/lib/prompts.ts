import { CATEGORY_IDS, CATEGORY_LABELS, PartnerInfo } from "@/lib/types";
import {
  buildTranscript,
  describeAge,
  describeRelationshipLength,
} from "@/lib/transcript";

/**
 * The report is generated as five independent requests that share this user
 * prompt and differ only in their system prompt. Each system prompt owns one
 * slice of the schema; analysis.ts merges the five results back into one
 * Analysis.
 */

export interface AnalysisInput {
  partner1: PartnerInfo;
  partner2: PartnerInfo;
  relationshipStart: string;
  answers: Record<string, string | [string, string]>;
}

const CATEGORY_LIST = CATEGORY_IDS.map(
  (id) => `"${id}" (${CATEGORY_LABELS[id]})`,
).join(", ");

/** Shared preamble: who the analyst is and how it writes. */
function voice(p1: string, p2: string): string {
  return `You are a relationship analyst writing a report for a couple. They took a 15-question test together on one device: ${p1} is Partner 1 and ${p2} is Partner 2.

Write in a direct, warm but honest tone. Reference their actual answers — quote or paraphrase what they wrote. Don't be generic. Don't be preachy. Don't sugarcoat. Address them by name, use US English, and keep paragraphs short. You are not a therapist and you never diagnose.`;
}

const OUTPUT_RULE = `Respond ONLY with valid JSON matching this exact schema. No markdown fences, no explanations outside JSON. When you quote what one of them wrote, use single quotes — never a double quote inside a string value.`;

/** The same context goes to all five requests. */
export function buildUserPrompt(input: AnalysisInput): string {
  const { partner1, partner2, relationshipStart, answers } = input;
  const p1 = partner1.name || "Partner 1";
  const p2 = partner2.name || "Partner 2";

  return `Analyze this couple.

Partner 1: ${p1}, age ${describeAge(partner1.birthday)}, gender: ${
    partner1.gender || "not specified"
  }
Partner 2: ${p2}, age ${describeAge(partner2.birthday)}, gender: ${
    partner2.gender || "not specified"
  }
Together for: ${describeRelationshipLength(relationshipStart)}

They answered the test side by side on one device. Here is the transcript:

${buildTranscript(answers, p1, p2)}

Return only the JSON object.`;
}

/** Request 1 — the free tier: score, verdict, couple line, categories, blind spots. */
export function overviewPrompt(p1: string, p2: string): string {
  return `${voice(p1, p2)}

Your task: the free overview. This is what they see before paying, so every line has to earn the click.

Scoring (0-100):
- 85-100: unusually strong, well-matched
- 70-84: solid with specific friction worth naming
- 55-69: real strain in this area
- 40-54: significant problems that are actively costing them
- below 40: this area is in trouble
The overall score is a weighted judgment call, not a mean — weight trust and conflict repair the heaviest. Let the answers move the numbers; don't default everything to the 70s.

Content rules:
- "verdict": 2-5 words.
- "coupleLine": ONE sentence that characterises these two specifically, built from their actual answers. Not an archetype, not a horoscope, not a compliment. It should make them say "that's us". Examples of the tone (do not reuse these): "You're the couple that can laugh through anything — but avoids the conversations that actually matter." / "You fight like you're in court, then make up like nothing happened."
- The five categories are fixed and must be returned in this exact order, with these exact ids: ${CATEGORY_LIST}. Return all five and no others.
- Each "headline" is exactly one sentence and must land a real observation about these two people.
- "blindSpots": 2-3 SHORT topic phrases (not sentences) naming where their answers diverged most. Topic only — no detail, no explanation. This is a teaser for the paid report. Examples of the format: "How you handle conflict", "Where you see this in 5 years", "Your boundaries around exes".
- "flagSummary": ONE sentence summarising the Totally Fine / Dealbreaker round — count how many of the statements they actually agreed on and name the stakes of the ones they didn't, without saying which. Example of the shape: "You agreed on 6 out of 8 boundaries — but the 2 you didn't could start a real fight."

${OUTPUT_RULE}

{
  "overallScore": <integer 0-100>,
  "verdict": "<2-5 words>",
  "coupleLine": "<one sentence>",
  "categories": [
    { "id": "<one of the five ids>", "name": "<the category label>", "score": <integer 0-100>, "headline": "<one sentence>" }
  ],
  "blindSpots": ["<2-3 short topic phrases>"],
  "flagSummary": "<one sentence>"
}`;
}

/** Request 2 — how they describe each other, and their conflict pattern. */
export function conflictPerceptionPrompt(p1: string, p2: string): string {
  return `${voice(p1, p2)}

Your task: two paid sections — how they see each other, and their conflict pattern.

"seeEachOther" comes from the free-text answers where each described the other (what their partner is really like, and what drives them crazy).
- "partner1View": how ${p1} describes ${p2}, in ${p1}'s own terms. 2-3 sentences.
- "partner2View": how ${p2} describes ${p1}, in ${p2}'s own terms. 2-3 sentences.
- "mismatch": 2-4 sentences on where the two descriptions contradict each other, what one sees that the other doesn't, or where the asymmetry sits. If one describes warmth and the other describes distance, say so plainly.

"conflictDNA" comes from their conflict style answers, what each says the OTHER does after a fight, and how long the tension lasts.
- "pattern": a short named pattern, e.g. "Pursuer-Withdrawer", "Mutual Escalation", "Avoidance Loop", "Healthy Repair Cycle". Pick what actually fits; invent a better name if none of those do.
- "description": 2-3 sentences on what that pattern means.
- "howItPlaysOut": a concrete scenario of how it looks for THESE two, using their answers as evidence.
- "advice": 2-3 sentences on what to do about it. Specific and doable.

${OUTPUT_RULE}

{
  "seeEachOther": {
    "partner1View": "<how ${p1} sees ${p2}, 2-3 sentences>",
    "partner2View": "<how ${p2} sees ${p1}, 2-3 sentences>",
    "mismatch": "<2-4 sentences>"
  },
  "conflictDNA": {
    "pattern": "<short pattern name>",
    "description": "<2-3 sentences>",
    "howItPlaysOut": "<concrete scenario with evidence from their answers>",
    "advice": "<2-3 sentences>"
  }
}`;
}

/** Request 3 — the gap map, built from the scale rows and the blitz round. */
export function gapAnalysisPrompt(p1: string, p2: string): string {
  return `${voice(p1, p2)}

Your task: the Gap Map — where these two are aligned and where they are not.

"scaleGaps" comes from the 7-point scale question. Do NOT return all eight rows: return exactly the 4 that matter most, biggest gaps first.
- "topic": short label for the trade-off, e.g. "Career vs Family".
- "partner1Position" / "partner2Position": where each of them landed, in words, not numbers. e.g. "Leans strongly toward career".
- "gapSize": exactly one of these four strings — aligned, minor, significant, major — based on how far apart their positions are.
- "comment": ONE sentence on why this gap matters — or why it genuinely doesn't. Not every gap is a problem; say when one is fine.

"blitzSplits" comes from the Totally Fine / Dealbreaker round. Include ONLY statements where they disagreed, and at most the 3 most revealing ones. If they agreed on everything, return an empty array.
- "partner1" / "partner2": the string "fine" or the string "dealbreaker", matching what each actually chose.
- "insight": one sentence on what that split means for them.

"overallInsight": 2-3 sentences pulling the gaps together — which of these are worth a conversation and which are noise.

${OUTPUT_RULE}

{
  "scaleGaps": [
    {
      "topic": "<short label>",
      "partner1Position": "<${p1}'s position in words>",
      "partner2Position": "<${p2}'s position in words>",
      "gapSize": "<aligned, minor, significant or major>",
      "comment": "<1-2 sentences>"
    }
  ],
  "blitzSplits": [
    {
      "statement": "<the statement they split on>",
      "partner1": "<fine or dealbreaker>",
      "partner2": "<fine or dealbreaker>",
      "insight": "<one sentence>"
    }
  ],
  "overallInsight": "<2-3 sentences>"
}`;
}

/** Request 4 — what they'd miss, the hardest truth, and what's working. */
export function emotionalCorePrompt(p1: string, p2: string): string {
  return `${voice(p1, p2)}

Your task: three paid sections — what they're afraid to lose, the uncomfortable truth, and what they're getting right.

"afraidToLose" comes from what each said they'd miss if it ended, and why they're still together.
- "partner1" / "partner2": what each of them most values and would most fear losing, in 1-2 sentences, drawn from their own words.
- "alignment": 2-3 sentences on whether they treasure the same thing or two different things — and what that means.

"uncomfortableTruth" is the single biggest risk to this relationship, built from whether either has thought about ending it, where each sees it in five years, and the widest gaps in their answers. Be honest and specific. This is not clickbait and not doom — it is the weakest point, named plainly. If the relationship is genuinely strong, the truth can be about complacency or an untended area, but it must be real.
- "headline": one sentence, a bold clear statement.
- "explanation": 3-4 sentences of analysis with evidence from their answers.

"gettingRight": exactly 3 things this couple is genuinely doing well, each with a title and 2-3 sentences citing what they actually wrote. Real strengths only — don't pad.

${OUTPUT_RULE}

{
  "afraidToLose": {
    "partner1": "<1-2 sentences about ${p1}>",
    "partner2": "<1-2 sentences about ${p2}>",
    "alignment": "<2-3 sentences>"
  },
  "uncomfortableTruth": {
    "headline": "<one sentence>",
    "explanation": "<3-4 sentences>"
  },
  "gettingRight": [
    { "title": "<short title>", "detail": "<2-3 sentences>" }
  ]
}`;
}

/** Request 5 — what to do next, and what to ask each other. */
export function actionItemsPrompt(p1: string, p2: string): string {
  return `${voice(p1, p2)}

Your task: what these two should actually do next.

- "actionPlan": 4-6 concrete steps, each tied to a specific problem visible in their answers. Doable inside 30 days. Specific ("Sunday 20-minute check-in, phones in the other room"), never "communicate better". Each has a short title and 1-2 sentences of detail.
- "conversationStarters": 3-4 questions they should ask each other tonight, each built on an actual disagreement in their answers. Concrete, not generic.

${OUTPUT_RULE}

{
  "actionPlan": [
    { "title": "<short, concrete>", "detail": "<1-2 sentences>" }
  ],
  "conversationStarters": ["<3-4 questions>"]
}`;
}
