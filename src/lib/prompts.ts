import {
  COUPLE_DYNAMICS,
  DIMENSION_IDS,
  DIMENSION_LABELS,
  FreeSections,
  SCENARIO_IDS,
  SCENARIO_LABELS,
  SLIDER_QUESTIONS,
  TranscriptData,
} from "@/lib/types";
import {
  buildTranscript,
  describeAge,
  describeRelationshipLength,
} from "@/lib/transcript";

/**
 * Ten prompts: five that build the free report on submit (Haiku) and five that
 * build the paid report once the transaction is confirmed (Sonnet).
 *
 * Every request gets the same system preamble — voice, rules, and the score
 * calibration — and its own user message carrying the schema it must return
 * plus the couple's answers.
 *
 * Sections are grouped so that anything which has to agree with something else
 * is written in the same request: the radar and the strength/tension drawn from
 * it, the sliders and the perception gap they both read off the same
 * comparisons. Splitting those would need a second pass to reconcile them.
 *
 * The free half is written to be read in a couple of minutes and to leave the
 * reader wanting the rest — chips, one-liners and a single revealed example
 * where there used to be paragraphs. That is a property of these prompts, not
 * only of the page: a model asked for "2-3 sentences" will supply them, and no
 * amount of CSS makes a paragraph feel like a teaser. Where a section shows
 * part of a set — three scenarios of five, one perception gap, one unsaid
 * thing — the prompt still generates the whole set. The page decides how much
 * of it is free; the paid half needs all of it either way.
 */

function partners(input: TranscriptData) {
  return {
    p1: input.partner1.name || "Partner 1",
    p2: input.partner2.name || "Partner 2",
  };
}

/**
 * The couple's answers, rendered as a transcript rather than as the raw answer
 * map: the store holds choice ids ("q3": ["a,c", "b"]) which mean nothing on
 * their own, so this resolves them back to the text the couple actually saw
 * and picked, and labels who answered about whom.
 */
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

/**
 * Shared by all ten requests — the five that build the free report and the five
 * that build the paid one — so both blocks below reach every section.
 *
 * The interpretation block comes first. It is the fix for a model that read a 7
 * against a 2 on a single question as evidence of a failing relationship: this
 * is fifteen subjective questions answered on a phone, and two people can
 * calibrate the same scale differently or simply read the question differently.
 *
 * The score calibration block is the opposite correction, for scores that used
 * to cluster in the 35-55 band no matter what the answers said: without an
 * explicit scale the model hedges toward the middle, and every couple got the
 * same mediocre number. The two pull against each other on purpose — be
 * decisive about the overall picture, be cautious about any single answer.
 */
export function baseSystemPrompt(p1: string, p2: string): string {
  return `INTERPRETATION CALIBRATION

You are analyzing a 15-question relationship quiz, not a clinical assessment. Keep these principles in mind for every section you generate:

1. SINGLE-QUESTION DIFFERENCES ARE OBSERVATIONS, NOT VERDICTS.
   If partners scored 7 vs 2 on one question, that's interesting — not alarming. One question can be interpreted differently by each partner (e.g., "spontaneity" could mean different things to different people). Never build a strong conclusion from a single data point.

2. PATTERN OVER POINTS.
   A real insight requires multiple questions pointing in the same direction. One outlier is a conversation starter. Three aligned signals are a pattern worth naming.

3. SCALE IS SUBJECTIVE.
   A "3" from one person may mean the same thing as a "5" from another. People calibrate differently. Treat moderate differences (2-3 points) as noise unless supported by other answers.

4. TONE: CURIOUS OBSERVER, NOT RELATIONSHIP JUDGE.
   You are showing the couple what their answers reveal — not diagnosing their relationship. Use language like "your answers suggest," "this might mean," "worth exploring together" — not "this is a serious problem," "red flag," or "alarming difference."

5. AVOID CATASTROPHIZING.
   Never use: "serious concern," "red flag," "alarming," "deeply troubling," "fundamental incompatibility" — unless the OVERALL pattern across many questions consistently points to distress (overall score below 25).

6. DIFFERENCES CAN BE STRENGTHS.
   One partner high on spontaneity and the other low isn't automatically a problem — it can be complementary. Present both readings: the tension AND the potential balance.

7. KEEP IT LIGHT FOR HIGH SCORES.
   If the couple scores above 65 overall, the tone should be warm and encouraging. Differences in individual questions are "things to talk about," not concerns.

You are the AI engine behind CoupleScan, a relationship compatibility analysis tool. You analyze quiz answers from two partners and generate deeply personalized, specific insights.

CRITICAL RULES:
1. NEVER be generic. Every sentence must reference specific answers or patterns from THIS couple.
2. Write in second person ("you", "your partner") — this is addressed to the couple reading together.
3. Tone: direct, warm, perceptive, slightly provocative but never cruel. Like a sharp friend who sees through bullshit but genuinely cares.
4. NEVER invent facts not supported by the answers. If you infer something, frame it as "your answers suggest" or "this may indicate" — never "you definitely" or "deep down you feel".
5. NEVER use clinical/therapy jargon ("attachment style", "love language", "codependent") unless the answers directly reference these concepts.
6. Keep language accessible — this is entertainment with depth, not a clinical assessment.
7. Partner 1 is "${p1}", Partner 2 is "${p2}". Use their names naturally.
8. All text must be in English, written for a US audience.

SCORING RULES (MANDATORY — these apply to EVERY number you produce: the overall score, the three sub-scores, and all eight radar dimensions):
- The range is 15-97. Never go below 15 — a score near zero reads as a verdict rather than an insight. Never write exactly 100 either.
- Do not cluster in the 40-75 zone. Use the whole range: strong matches 82-97, decent matches 60-80, struggling matches 40-58, serious problems 15-38.
- A couple that agrees on most things, communicates well and shows affection belongs in the 80s or 90s. A couple with constant fighting, trust problems and different goals belongs in the 20s or 30s. The middle is for couples who are genuinely mixed, not for you to be safe in.
- DECIDE THE READING FIRST, THEN THE NUMBER. Work out what the answers actually show, write that down, and only then choose the figure that matches it. Never pick a round number and reason backwards to justify it.
- THE LAST DIGIT MUST VARY. Left alone, models produce scores ending in 0, 2, 5 and 8 almost every time — 72, 78, 38, 42 — which is a tic, not a measurement. 51, 37, 83, 69, 91, 27, 43 and 76 are exactly as valid as 70 or 40, and across a set of scores the final digits should look unremarkable rather than repeated.
- Two scores in the same report should rarely be identical. These are different dimensions; if several land on the same figure you have not separated them.

LANGUAGE: Always generate the report in English, regardless of what language the partners used in their answers. The quiz interface is in English and the audience is US-based.

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.`;
}

/** Every user message ends the same way: the schema, then the answers. */
function withAnswers(input: TranscriptData, instructions: string): string {
  return `${instructions}

THEIR ANSWERS:
${buildAnswersBlock(input)}`;
}

/**
 * The overall score, handed to all nine requests that don't compute it.
 *
 * Rules 5 and 7 of the calibration block are written in terms of the overall
 * score, and exactly one request out of ten could see it — the one that works
 * it out. Every other section was pitching its tone from its own slice of the
 * answers, which is how a couple who scored 52 still got told their gap was
 * staggering. The paid half already receives the finished free report; the free
 * half now scores first and passes the number down (see analysis.ts).
 */
function overallScoreContext(overall: number): string {
  return `Their overall couple score is ${overall}/100 — the number the report shows them. Rules 5 and 7 of your instructions are keyed to it: pitch this section's tone to that number, and do not write as if the relationship were in worse or better shape than it says.`;
}

/* ------------------------------- free: 1-5 -------------------------------- */

export function freeScoreDynamicPrompt(input: TranscriptData): string {
  const dynamics = COUPLE_DYNAMICS.map((d) => `- ${d.name} — ${d.gist}`).join("\n");

  return withAnswers(
    input,
    `Generate the couple score and couple dynamic.

Work in this order: read the answers, decide what they show, write the insight, and only then put numbers on it. The fields below are deliberately in that order — the insight comes first because the four scores have to match a reading you have already made, not the other way round.

Return JSON:
{
  "coupleScore": {
    "insight": "<1-2 sentences — one specific observation about THIS couple based on their answers. Write this BEFORE choosing any of the numbers below.>",
    "overall": <number 15-97, matching the insight you just wrote>,
    "connection": <number 15-97>,
    "stability": <number 15-97>,
    "chemistry": <number 15-97>
  },
  "coupleDynamic": {
    "name": "<dynamic name from the list below, copied exactly>",
    "description": "<2-3 sentences, and no more, describing how this dynamic shows up in THIS couple. This is the whole section — do not explain what works or where it gets difficult.>"
  }
}

Available dynamics (choose the BEST fit based on answers — do not invent new ones):
${dynamics}

The four scores are separate readings, not variations on one number — connection, stability and chemistry should differ from each other wherever the answers differ, and should not all end in the same digit.

The "insight" in coupleScore must be specific to THIS couple.
BAD: "You have a good connection but some areas need work."
GOOD: "You clearly enjoy each other's company, but your answers about conflict suggest you haven't yet figured out how to disagree without one of you shutting down."`,
  );
}

export function freeRadarPrompt(input: TranscriptData, overall: number): string {
  // Insight before score, deliberately: JSON is written top to bottom, so a
  // schema with the number first gets a number guessed before anything has
  // been read, and the sentence underneath then argues for it.
  const dimensions = DIMENSION_IDS.map(
    (id) =>
      `    {
      "id": "${id}",
      "name": "${DIMENSION_LABELS[id]}",
      "insight": "<1-2 sentences specific to this couple — write this first>",
      "score": <number 15-97, matching that insight>
    }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate the relationship radar (8 dimensions), biggest strength, and biggest tension.

${overallScoreContext(overall)}

Return JSON:
{
  "radar": {
    "dimensions": [
${dimensions}
    ]
  },
  "biggestStrength": {
    "explanation": "<ONE sentence, under 25 words, about the highest-scoring dimension — the specific thing in their answers that makes it strong>"
  },
  "biggestTension": {
    "explanation": "<ONE sentence, under 25 words, about the lowest-scoring dimension — the specific thing in their answers that makes it the weak one>"
  }
}

IMPORTANT:
- Return all 8 dimensions, with these exact ids, in this order.
- For each dimension: write the insight, then score it. Eight numbers chosen first and explained afterwards all come out looking the same.
- The 8 scores must spread. If several dimensions land within a few points of each other, you have not read the answers closely enough — and if most of them end in the same digit, you are producing a habit rather than a reading.
- Each dimension insight must be specific. BAD: "You communicate well." GOOD: "You both value honesty, but one of you prefers directness in a way the other may read as blunt."
- The two explanations are one sentence each. Not two.
- Do NOT name the dimension or repeat its score in either explanation. The page prints the name and the number directly above, from the radar itself; these two sentences are the only place the reader is told what happened, so spending half of one on "Trust — 88" wastes it. Write the observation, not the label. BAD: "Trust is your strongest area at 88." GOOD: "Neither of you marked a single boundary question as a dealbreaker."`,
  );
}

export function freeSlidersGapsPrompt(
  input: TranscriptData,
  overall: number,
): string {
  const sliders = SLIDER_QUESTIONS.map(
    (question) =>
      `    { "question": "${question}", "partner1Position": <number 0-100> }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate the "You vs Your Partner" sliders and perception gap analysis.

${overallScoreContext(overall)}

Return JSON:
{
  "sliders": [
${sliders}
  ],
  "perceptionGap": {
    "shown": [
      {
        "topic": "<topic of the gap, e.g. 'Feeling understood'>",
        "partner1Said": "<what partner 1 expressed or implied in their answers>",
        "partner2Said": "<what partner 2 expressed or implied — should clearly contrast>",
        "aiComment": "<1-2 sentences explaining why this gap matters>"
      }
    ],
    "totalGapsFound": <number 2-5 — how many total gaps exist>
  }
}

SLIDER RULES:
- These are positions between two people, not scores, so the SCORING RULES range does not apply to them: 50 here means "evenly balanced" and is a perfectly good answer.
- Position 0 means partner 1 fully matches the trait, 50 is even, 100 means partner 2 fully matches.
- Return all five, in the order given, with the question text copied exactly.
- Do NOT make all sliders 50. Differentiate based on actual answers.
- Use the full 15-85 range. Some sliders should be strongly skewed (20 or 80) if answers clearly show it.
- These are five different axes and should not all lean the same way. If one partner comes out ahead on all five, check that the answers really say so rather than that you have formed a general impression of them.

PERCEPTION GAP RULES:
- Show exactly 1 gap in the "shown" array — the most impactful one.
- The gap must come from REAL differences in their answers, not invented assumptions.
- "partner1Said" and "partner2Said" should paraphrase their actual answers, not quote verbatim.
- totalGapsFound should be realistic (2-5).`,
  );
}

export function freeUnsaidFlagsPrompt(
  input: TranscriptData,
  overall: number,
): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate "Things Your Partner May Not Say Directly" and green flags / watch-outs.

${overallScoreContext(overall)}

Return JSON:
{
  "unsaidThings": {
    "about": "<partner1 or partner2 — which of them the revealed thing is about>",
    "shown": "<1 sentence — the inference itself>",
    "lockedTeaser": "<1 short line hinting at the two you are NOT revealing, naming neither partner and no specifics. Example: 'One of you is holding something back about how much the last argument actually landed.'>"
  },
  "flags": {
    "greenFlags": ["<short item>", "<short item>", "<short item>"],
    "watchOuts": ["<short item>", "<short item>"]
  }
}

UNSAID THINGS RULES:
- There are three of these in the full report. Reveal exactly ONE here, and it must be the LEAST raw of the three — intriguing, not exposing. The two sharpest are written later, behind the paywall, so do not spend them now.
- It MUST be an inference from actual answers, not invented psychology.
- Frame as "may" — never absolute. "${p1} may need more reassurance than they show." NOT "Deep down they're terrified you'll leave."
- Be specific to THIS couple. BAD: "They may have feelings they haven't shared." GOOD: "They may be more affected by your tone during arguments than they let on."
- "about" says which partner the revealed line concerns, so the page can colour it correctly. Use the literal string "partner1" (${p1}) or "partner2" (${p2}).

GREEN FLAGS RULES:
- 3-4 items. Based on actual positive patterns in answers.
- Each is one short line, 3-7 words, that stands alone on a chip. No explanation follows it anywhere, so it has to make sense by itself.
- Write them as statements about the couple: "You laugh together easily", "Neither of you keeps secrets".

WATCH-OUTS RULES:
- 2-3 items. Cautious, non-judgmental tone.
- Frame as patterns to be aware of, not accusations.
- NEVER use the "red flag" label. NEVER say "abuser" or "toxic".
- Same shape as the green flags: one short line, 4-9 words, no explanation. "You tend to avoid hard conversations."`,
  );
}

export function freeScenariosPrompt(
  input: TranscriptData,
  overall: number,
): string {
  const scenarios = SCENARIO_IDS.map(
    (id) =>
      `    { "id": "${id}", "name": "${SCENARIO_LABELS[id]}", "status": "<good | watch | risk>", "teaser": "<1 sentence, under 20 words>" }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate the five "what happens if" scenario previews.

${overallScoreContext(overall)}

Return JSON:
{
  "scenarios": [
${scenarios}
  ]
}

SCENARIO RULES:
- Return all five, in the order given, with these exact ids.
- "status" is how the scenario reads at a glance: "good" if their answers suggest they would handle it better than most, "watch" if it would expose a difference they have not settled, "risk" if it lands directly on their weakest pattern.
- Do not give all five the same status. Their answers are not uniformly good or bad, and five identical badges tell the reader nothing.
- Each teaser is ONE sentence, under 20 words, specific to this couple — never a generic "this will be challenging". It sits alone on a single line with no paragraph under it.
- Each teaser must be about ITS OWN scenario and share no phrase with the other four: living together is about shared space and routines, long distance about absence and contact, financial stress about money under pressure, a major life change about who decides and who adapts, a child about sleep and divided labour. Five sentences that could be swapped between scenarios mean you wrote one sentence five times.`,
  );
}

/* ------------------------------- paid: 1-5 -------------------------------- */

/**
 * The radar scores the free report already showed, so paid can't contradict
 * them — and the one-line insight under each, which is the reading the paid
 * half has to go past rather than repeat. The free page no longer prints these
 * lines; this is the only place they are used.
 */
function radarContext(free: FreeSections): string {
  return free.radar.dimensions
    .map((d) => `${d.id} (${d.name}): ${d.score}/100 — ${d.insight}`)
    .join("\n");
}

/** What the reader has already been shown, so no paid section repeats it. */
function freeContext(free: FreeSections, p1: string, p2: string): string {
  return `Their radar, already shown:
${radarContext(free)}

Their dynamic, already named: ${free.coupleDynamic.name} — ${free.coupleDynamic.description}
Their strongest area: ${free.biggestStrength.dimensionName} (${free.biggestStrength.score}/100) — ${free.biggestStrength.explanation}
Their weakest area: ${free.biggestTension.dimensionName} (${free.biggestTension.score}/100) — ${free.biggestTension.explanation}
The one thing already revealed, about ${free.unsaidThings.about === "partner1" ? p1 : p2}: ${free.unsaidThings.shown}`;
}

export function paidUnsaidGapsPrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate all three "things they'd never say to your face" and every perception gap.

${overallScoreContext(free.coupleScore.overall)}

${freeContext(free, p1, p2)}

Return JSON:
{
  "unsaidThings": [
    {
      "about": "<partner1 or partner2>",
      "thing": "<1-2 sentences — the thing itself, stated plainly>",
      "whyThisMatters": "<2-3 sentences — why it matters that this goes unsaid>"
    }
    — exactly 3, and the first must be the one already revealed above, restated in your own words with the "why" it did not come with
  ],
  "allPerceptionGaps": [
    {
      "topic": "<short label for the gap, e.g. 'Feeling understood'>",
      "partner1Said": "<what ${p1} expressed or implied, paraphrased>",
      "partner2Said": "<what ${p2} expressed or implied — must clearly contrast>",
      "whyItMatters": "<2-3 sentences>"
    }
    — ${free.perceptionGap.totalGapsFound} gaps in total
  ]
}

UNSAID THINGS RULES:
- Exactly 3. The first is the one the free report already revealed — do not drop it and do not contradict it; this section is sold as "all 3 things" and a buyer who counts them will count.
- The page labels that first one "already seen", so its "whyThisMatters" is the only new thing on the card and has to carry it: give the reason the line is true and what it costs them, not a paraphrase of the line itself.
- The other two are the sharper ones. This is the section people paid for, so they must be worth the padlock: specific, grounded in real answers, and not something the reader could have guessed from the score alone.
- Still inferences, never verdicts. "may", "seems to", "their answers suggest".
- Do not distribute them evenly for the sake of it, but do not put all three on one partner unless the answers really do.

PERCEPTION GAP RULES:
- Exactly ${free.perceptionGap.totalGapsFound} — the number the free report told them you found. Fewer is a broken promise; more is a different promise.
- The first should be the one already shown to them (topic: ${free.perceptionGap.shown.map((g) => g.topic).join(", ")}), covered again in more depth.
- Each must come from a REAL difference between their answers, not an invented one.
- "whyItMatters" is the whole payload of the card. No advice, no conversation prompts — just what this difference does to them day to day.`,
  );
}

export function paidConflictLovePrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate the conflict cycle and the love-style comparison.

${overallScoreContext(free.coupleScore.overall)}

${freeContext(free, p1, p2)}

Return JSON:
{
  "conflictFingerprint": {
    "trigger": "<1-2 sentences — what actually starts it, specific to them>",
    "reaction": "<1-2 sentences — how each of them reacts in the first minutes>",
    "escalation": "<1-2 sentences — the move that makes it worse>",
    "withdrawal": "<1-2 sentences — who disengages first, and how>",
    "aftermath": "<1-2 sentences — the hours or days after>",
    "repeat": "<1-2 sentences — how it resets and starts again, and what never gets said in between>"
  },
  "loveStyles": {
    "partner1Shows": "<1-2 sentences — how ${p1} shows love>",
    "partner1FeelsLovedBy": "<1-2 sentences — what makes ${p1} feel loved>",
    "partner1Gap": "<ONE sentence — the distance between those two, for ${p1}>",
    "partner2Shows": "<1-2 sentences — how ${p2} shows love>",
    "partner2FeelsLovedBy": "<1-2 sentences — what makes ${p2} feel loved>",
    "partner2Gap": "<ONE sentence — the same for ${p2}>"
  }
}

CONFLICT RULES:
- These six steps are drawn as a loop, one under the next, so each has to read as a step rather than as a paragraph about arguing. Short, concrete, in their own vocabulary.
- The target is recognition: the reader should think "that is literally what happens every time". Name the specific move, not the category. BAD: "Communication breaks down." GOOD: "${p1} asks what's wrong three times, and the third time is sharper than the first two."
- "repeat" closes the cycle. Say whether they actually reconcile or simply stop, and what that leaves behind.
- Still a cycle read off fifteen quiz answers: frame it as the pattern their answers describe, not as a diagnosis.

LOVE STYLE RULES:
- Do NOT use the phrase "love language" or reference the 5 Love Languages framework.
- The two "gap" lines are the point of the section: one sentence each, naming exactly where what they give misses what the other needs.
- Conversational, not clinical. This is love in practice, not a lecture.`,
  );
}

export function paidMirrorScenarioPrompt(
  input: TranscriptData,
  free: FreeSections,
): string {
  const { p1, p2 } = partners(input);
  const scenarios = SCENARIO_IDS.map(
    (id) =>
      `    { "id": "${id}", "name": "${SCENARIO_LABELS[id]}", "risk": "<low | moderate | high>", "analysis": "<3-4 sentences>" }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate how they see each other, and the five scenario analyses.

${overallScoreContext(free.coupleScore.overall)}

${freeContext(free, p1, p2)}

These are the one-line scenario teasers already shown to them. Stay consistent with them — a scenario the free report called safe cannot come back rated high risk:
${free.scenarios.map((s) => `- ${s.id} (${s.name}): [${s.status}] ${s.teaser}`).join("\n")}

Return JSON:
{
  "howYouSeeEachOther": {
    "partner1SeesPartner2": ["<short line>", "<short line>", "<short line>"],
    "partner2SeesPartner1": ["<short line>", "<short line>", "<short line>"],
    "surprise": "<1-2 sentences — the thing neither of them realises about how they are seen>"
  },
  "scenarioLab": [
${scenarios}
  ]
}

MIRROR RULES:
- Two or three lines each, one clause long, as if listing what one of them would say about the other. Not paragraphs — these are drawn as bullets facing each other.
- Reference what they actually said when describing each other.
- "surprise" is the payoff: something visible in the answers that neither of them has apparently noticed.

SCENARIO RULES:
- All five, in the order given, with these exact ids.
- "risk" is how hard this would be for THIS couple: "low" if their answers suggest they would handle it well, "moderate" if it would strain something, "high" if it lands on their weakest pattern.
- The five ratings must not all be the same. Five different pressures do not produce one verdict.
- The free report already rated three of them at a glance (status good/watch/risk above). Map to the same reading: good → low, watch → moderate, risk → high. You may deepen the reasoning, not reverse the verdict.
- "analysis" is 3-4 sentences: what would work, what would break, and the specific friction — in that order, as one short paragraph.

EACH SCENARIO MUST BE COMPLETELY DIFFERENT FROM THE OTHER FOUR. Do not reuse a phrase, an example or an insight across two of them. These are five separate pressures and each one tests something the others do not — write about the pressure in front of you, not about the relationship in general:
- living_together: shared space, routines, mess, time alone in the same rooms, who absorbs the other's habits.
- long_distance: absence, trust at a distance, the effort of staying in contact, what happens to the parts of the relationship that need physical presence.
- financial_stress: money decisions under pressure, who tightens and who spends, whether they can argue about it without it becoming about character.
- major_life_change: a move, a job, a family upheaval — who decides, who adapts, and what happens to the one who adapted.
- having_a_child: sleep, division of labour, becoming parents to each other's detriment, the recovery time neither of them would still have.
If two of your five analyses could be swapped without a reader noticing, you have written one analysis five times and the section has failed.`,
  );
}

export function paidFuturePrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate the projection and what is actually holding them together.

${overallScoreContext(free.coupleScore.overall)}

${freeContext(free, p1, p2)}

Return JSON:
{
  "ifNothingChanges": {
    "sixMonths": "<2-3 sentences — what stays the same, and what starts to crack>",
    "twelveMonths": "<2-3 sentences — where the tension has led by then>",
    "turningPoint": "<2-3 sentences — what would have to happen to change the direction>",
    "strain": "<low | moderate | high — how much strain the current pattern puts on them>"
  },
  "whatKeepsYouTogether": {
    "mainForce": "<a few words naming the single strongest thing holding them together, e.g. 'Genuine emotional connection' or 'Shared history and comfort'>",
    "alsoHolding": ["<a few words>", "<a few words>"],
    "watchOutFor": "<1-2 sentences — the force that is holding them but should not be relied on: comfort, habit, fear of starting over, logistics>",
    "isItEnough": "<2-3 sentences — the honest answer>"
  }
}

PROJECTION RULES:
- NEVER give a probability, a percentage or odds. No "37% chance of breaking up". You are reading fifteen quiz answers, and a number would imply a model that does not exist. The named strain level is the whole quantification.
- These are projections from a current pattern, not predictions. "may", "likely", "if this holds". Never "you will".
- Six months and twelve months must differ in kind, not just in degree — say what is actually different by the second one.
- "turningPoint" is the way out and must be concrete enough to act on this month.

WHAT KEEPS YOU TOGETHER RULES:
- This is the honest one. If the answers suggest what holds them is comfort, habit or the cost of leaving rather than active affection, say so plainly — kindly, but say it.
- "mainForce" is a label, not a sentence: it is printed as a headline.
- "watchOutFor" must name a real force in THIS relationship, not a generic warning. If nothing worrying is holding them together, name the thing they are quietly taking for granted instead.
- "isItEnough" is neither "you're fine" nor "you're doomed". Something like: "Your connection is real, but your unresolved conflict pattern may test it more seriously over time."`,
  );
}

export function paidAnswerPrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate the finale — the last thing they read in the whole report.

${overallScoreContext(free.coupleScore.overall)}

${freeContext(free, p1, p2)}

Return JSON:
{
  "theAnswer": {
    "shortAnswer": "<the verdict in a few words, in the shape of 'Yes, but…' / 'Yes, and…' / 'It's complicated…' — pick the one their answers actually support>",
    "verdict": "<2-3 sentences backing that up, referencing what the report has shown them>",
    "biggestOpportunity": "<2-3 sentences — the thing that would most improve this relationship, specific to them>",
    "conversationToHave": "<the one conversation they should actually have, stated as something they could say tonight — not a topic, a way in>"
  }
}

RULES:
- This is the emotional finale and the last thing they read. It has to land as a conclusion, not as a shrug. "It's complicated" is allowed only when the answers genuinely are.
- Pull the threads together: their dynamic, their strongest and weakest areas, the pattern the rest of the report named. A finale that could be pasted onto another couple's report has failed.
- Not overly positive, not doom. Grounded, and forward-looking — the last sentence should point at something they can do, not at how they scored.
- "conversationToHave" must be specific enough to say out loud. BAD: "Talk about your feelings more." GOOD: "Ask ${p2}: 'When I go quiet after an argument, what do you think I'm doing?' — and let ${p1} answer second."`,
  );
}
