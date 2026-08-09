import {
  CATEGORY_IDS,
  CATEGORY_LABELS,
  FreeReport,
  TranscriptData,
} from "@/lib/types";
import {
  buildTranscript,
  describeAge,
  describeRelationshipLength,
} from "@/lib/transcript";

/**
 * Two prompts, two models, two moments:
 *
 *   free — Haiku, on submit. One request, so there is nothing to repeat itself
 *          against and the reader gets a report immediately.
 *   paid — Sonnet, after payment. Also one request: every section is written
 *          with the whole picture in view, which is what stops the same vivid
 *          answer being quoted in four places.
 */

const CATEGORY_LIST = CATEGORY_IDS.map(
  (id) => `"${id}" (${CATEGORY_LABELS[id]})`,
).join(", ");

const JSON_ONLY =
  "Respond ONLY with valid JSON matching this exact schema. No markdown fences, no explanations outside JSON.";

function partners(input: TranscriptData) {
  return {
    p1: input.partner1.name || "Partner 1",
    p2: input.partner2.name || "Partner 2",
  };
}

/** The couple's answers, rendered the same way for both passes. */
export function buildAnswersBlock(input: TranscriptData): string {
  const { p1, p2 } = partners(input);

  return `Partner 1: ${p1}, age ${describeAge(input.partner1.birthday)}, gender: ${
    input.partner1.gender || "not specified"
  }
Partner 2: ${p2}, age ${describeAge(input.partner2.birthday)}, gender: ${
    input.partner2.gender || "not specified"
  }
Together for: ${describeRelationshipLength(input.relationshipStart)}

They answered side by side on one device. Transcript:

${buildTranscript(input.answers, p1, p2)}`;
}

/* --------------------------------- free ---------------------------------- */

export function freePrompt(input: TranscriptData): string {
  const { p1, p2 } = partners(input);

  return `You are analyzing a relationship test taken by two partners: ${p1} and ${p2}.

Generate the FREE overview of their relationship report.

INSTRUCTIONS:
- Be warm but honest.
- Overall score: genuine compatibility 0-100, not artificially high or low. Weight trust and conflict repair the heaviest.
- Hidden Dynamic: choose or create a relationship archetype — e.g. "The Pursuer & Withdrawer", "The Fire & Ice", "The Best Friends", "The Parent & Child", "The Anchor & Kite", "The Mirror". Give the name plus 2-3 sentences explaining WHY it fits THESE two specifically, referencing their actual answers. Invent a better name if none of those fit.
- Category scores should vary meaningfully — do not cluster them all around the same number.
- Each headline is exactly one sentence and must land a real observation about these two people.
- The five categories are fixed and must be returned in this order, with these exact ids: ${CATEGORY_LIST}.
- Flag summary: one line based on the Totally Fine / Dealbreaker round. Count how many statements they actually agreed on and name the stakes of the ones they didn't, without saying which.

ANSWERS:
${buildAnswersBlock(input)}

${JSON_ONLY}

{
  "overallScore": <integer 0-100>,
  "verdict": "<one short sentence>",
  "hiddenDynamic": {
    "type": "<archetype name>",
    "description": "<2-3 sentences, specific to this couple>"
  },
  "categories": [
    { "id": "<one of the five ids>", "name": "<the category label>", "score": <integer 0-100>, "headline": "<one sentence>" }
  ],
  "flagSummary": "<one sentence>"
}`;
}

/* --------------------------------- paid ---------------------------------- */

export function paidPrompt(input: TranscriptData, free: FreeReport): string {
  const { p1, p2 } = partners(input);

  const freeContext = `Overall score: ${free.overallScore}/100 — ${free.verdict}
Hidden dynamic already shown to them: "${free.hiddenDynamic.type}" — ${free.hiddenDynamic.description}
Category scores: ${free.categories
    .map((c) => `${c.name} ${c.score}/100 (${c.headline})`)
    .join("; ")}
Boundaries summary already shown to them: ${free.flagSummary}`;

  return `You are a relationship analyst writing the PAID deep-dive for ${p1} and ${p2}.

They already received their free overview (DO NOT contradict it):

FREE OVERVIEW:
${freeContext}

FULL ANSWERS:
${buildAnswersBlock(input)}

CRITICAL RULES:
1. Different love languages are NORMAL. Describing memories or feelings is equally valid as describing partner traits. Never pathologize different expression styles.
2. Focus on PATTERNS across multiple answers, not single responses. One answer = data point. Three consistent answers = pattern.
3. Be specific — reference THEIR actual words. No generic advice.
4. Each section must reveal something NEW. If two sections would say the same thing, one of them is wrong.
5. Write like a sharp friend who happens to be a therapist — warm but direct, no fluff.

${JSON_ONLY}

{
  "biggestSurprise": {
    "insight": "<one unexpected finding that breaks assumptions. NOT 'you're different'. Something that makes them think.>"
  },
  "seeEachOther": {
    "partner1View": "<how ${p1} described ${p2}, and what it reveals>",
    "partner2View": "<how ${p2} described ${p1}, and what it reveals>",
    "dynamic": "<what the contrast or similarity tells about the relationship>"
  },
  "biggestMisunderstanding": {
    "partner1Thinks": "<one sentence: what ${p1} believes they're doing>",
    "partner2Experiences": "<one sentence: how ${p2} actually experiences it>"
  },
  "conflictDNA": {
    "pattern": "<their conflict cycle as a couple>",
    "trigger": "<what usually starts it>",
    "escalation": "<how it escalates>",
    "aftermath": "<what happens after, based on how long the tension lasts>",
    "insight": "<the real issue underneath>"
  },
  "howYouLove": {
    "partner1": "<2-3 sentences: how ${p1} expresses and needs love. Specific behaviours from their answers, not labels.>",
    "partner2": "<2-3 sentences: same for ${p2}>",
    "friction": "<where these styles create friction>"
  },
  "ifNothingChanges": {
    "prediction": "<what likely happens in 6-12 months if current patterns continue. Specific and honest, not dramatic.>",
    "why": "<evidence from their answers>"
  },
  "whatKeepsYouTogether": {
    "core": "<the one deep thing holding this relationship together. Not a list — one insight.>",
    "evidence": "<proof from their answers>"
  },
  "biggestQuestion": {
    "question": "<one powerful question for both of them>",
    "conversationStarters": ["<3 concrete questions built on actual disagreements in their answers>"]
  }
}`;
}
