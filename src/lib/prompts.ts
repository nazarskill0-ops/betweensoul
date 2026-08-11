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
   Never use: "serious concern," "red flag," "alarming," "deeply troubling," "fundamental incompatibility" — unless the OVERALL pattern across many questions consistently points to distress (overall score below 30).

6. DIFFERENCES CAN BE STRENGTHS.
   One partner high on spontaneity and the other low isn't automatically a problem — it can be complementary. Present both readings: the tension AND the potential balance.

7. KEEP IT LIGHT FOR HIGH SCORES.
   If the couple scores above 65 overall, the tone should be warm and encouraging. Differences in individual questions are "things to talk about," not concerns.

You are the AI engine behind CouplesScan, a relationship compatibility analysis tool. You analyze quiz answers from two partners and generate deeply personalized, specific insights.

CRITICAL RULES:
1. NEVER be generic. Every sentence must reference specific answers or patterns from THIS couple.
2. Write in second person ("you", "your partner") — this is addressed to the couple reading together.
3. Tone: direct, warm, perceptive, slightly provocative but never cruel. Like a sharp friend who sees through bullshit but genuinely cares.
4. NEVER invent facts not supported by the answers. If you infer something, frame it as "your answers suggest" or "this may indicate" — never "you definitely" or "deep down you feel".
5. NEVER use clinical/therapy jargon ("attachment style", "love language", "codependent") unless the answers directly reference these concepts.
6. Keep language accessible — this is entertainment with depth, not a clinical assessment.
7. Partner 1 is "${p1}", Partner 2 is "${p2}". Use their names naturally.
8. All text must be in English, written for a US audience.

SCORE CALIBRATION (MANDATORY):
Your scores MUST use the full 0-100 range based on what the answers actually show.
- 85-100: Exceptional. Clear evidence of strong alignment, mutual understanding, and healthy patterns.
- 70-84: Strong. Good foundation with minor friction points.
- 55-69: Mixed. Real strengths exist alongside real concerns.
- 40-54: Concerning. Significant patterns that need attention.
- 25-39: Struggling. Multiple areas of disconnect or tension.
- 0-24: Critical. Fundamental misalignment or harmful patterns.
DO NOT default to the 35-55 range. Most couples should land clearly ABOVE or BELOW 50.
A couple that agrees on most things, communicates well, and shows affection = 75-90.
A couple with constant fighting, trust issues, and different goals = 15-35.
Mid-range (40-60) is ONLY for genuinely ambiguous cases.
Score honestly rather than defaulting to a safe middle. The one exception: where the answers point at the very bottom of the range, do not go below 25 — a couple who took a quiz together deserves a reading they can act on, not a verdict.

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.`;
}

/** Every user message ends the same way: the schema, then the answers. */
function withAnswers(input: TranscriptData, instructions: string): string {
  return `${instructions}

THEIR ANSWERS:
${buildAnswersBlock(input)}`;
}

/* ------------------------------- free: 1-5 -------------------------------- */

export function freeScoreDynamicPrompt(input: TranscriptData): string {
  const dynamics = COUPLE_DYNAMICS.map((d) => `- ${d.name} — ${d.gist}`).join("\n");

  return withAnswers(
    input,
    `Generate the couple score and couple dynamic.

Return JSON:
{
  "coupleScore": {
    "overall": <number 0-100>,
    "connection": <number 0-100>,
    "stability": <number 0-100>,
    "chemistry": <number 0-100>,
    "insight": "<1-2 sentences — one specific observation about THIS couple based on their answers>"
  },
  "coupleDynamic": {
    "name": "<dynamic name from the list below, copied exactly>",
    "description": "<2-3 sentences describing how this dynamic manifests in THIS couple>",
    "whatWorks": "<2-3 sentences about the strengths of this dynamic, specific to their answers>",
    "whereItGetsDifficult": "<2-3 sentences about the friction points, specific to their answers>"
  }
}

Available dynamics (choose the BEST fit based on answers — do not invent new ones):
${dynamics}

The four scores are separate readings, not variations on one number — connection, stability and chemistry should differ from each other wherever the answers differ.

The "insight" in coupleScore must be specific to THIS couple.
BAD: "You have a good connection but some areas need work."
GOOD: "You clearly enjoy each other's company, but your answers about conflict suggest you haven't yet figured out how to disagree without one of you shutting down."`,
  );
}

export function freeRadarPrompt(input: TranscriptData): string {
  const dimensions = DIMENSION_IDS.map(
    (id) =>
      `    {
      "id": "${id}",
      "name": "${DIMENSION_LABELS[id]}",
      "score": <number 0-100>,
      "insight": "<1-2 sentences specific to this couple>"
    }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate the relationship radar (8 dimensions), biggest strength, and biggest tension.

Return JSON:
{
  "radar": {
    "dimensions": [
${dimensions}
    ],
    "interconnection": "<1-2 sentences showing how 2-3 dimensions relate to each other for THIS couple. Example: 'Your high trust combined with low conflict recovery suggests the issue isn't safety — it's that you avoid hard conversations because you feel secure enough to postpone them.'>"
  },
  "biggestStrength": {
    "dimensionId": "<id of the highest-scoring dimension>",
    "dimensionName": "<name>",
    "score": <the score>,
    "explanation": "<2-3 sentences why this is strong, referencing specific answers>",
    "whyItMatters": "<1-2 sentences>"
  },
  "biggestTension": {
    "dimensionId": "<id of the lowest-scoring dimension>",
    "dimensionName": "<name>",
    "score": <the score>,
    "explanation": "<2-3 sentences what the tension is, referencing specific answers>"
  }
}

IMPORTANT:
- Return all 8 dimensions, with these exact ids, in this order.
- biggestStrength.dimensionId MUST be the highest-scoring dimension from radar.
- biggestTension.dimensionId MUST be the lowest-scoring dimension from radar.
- The 8 scores must spread. If several dimensions land within a few points of each other, you have not read the answers closely enough.
- The "interconnection" field is critical — it shows you are actually THINKING, not just listing scores. Find a real relationship between 2-3 dimensions.
- Each dimension insight must be specific. BAD: "You communicate well." GOOD: "You both value honesty, but one of you prefers directness in a way the other may read as blunt."`,
  );
}

export function freeSlidersGapsPrompt(input: TranscriptData): string {
  const sliders = SLIDER_QUESTIONS.map(
    (question) =>
      `    { "question": "${question}", "partner1Position": <number 0-100> }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate the "You vs Your Partner" sliders and perception gap analysis.

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
- Position 0 means partner 1 fully matches the trait, 50 is even, 100 means partner 2 fully matches.
- Return all six, in the order given, with the question text copied exactly.
- Do NOT make all sliders 50. Differentiate based on actual answers.
- Use the full 15-85 range. Some sliders should be strongly skewed (20 or 80) if answers clearly show it.

PERCEPTION GAP RULES:
- Show exactly 1 gap in the "shown" array — the most impactful one.
- The gap must come from REAL differences in their answers, not invented assumptions.
- "partner1Said" and "partner2Said" should paraphrase their actual answers, not quote verbatim.
- totalGapsFound should be realistic (2-5).`,
  );
}

export function freeUnsaidFlagsPrompt(input: TranscriptData): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate "Things Your Partner May Not Say Directly" and green flags / watch-outs.

Return JSON:
{
  "unsaidThings": {
    "partner1": {
      "shown": [
        "<1 sentence — inference about what ${p1} may not express directly, based on their answers>",
        "<1 sentence — second inference>"
      ],
      "hasLocked": true
    },
    "partner2": {
      "shown": [
        "<1 sentence — inference about ${p2}>",
        "<1 sentence — second inference>"
      ],
      "hasLocked": true
    }
  },
  "flags": {
    "greenFlags": ["<short item>", "<short item>", "<short item>"],
    "watchOuts": ["<short item>", "<short item>"]
  }
}

UNSAID THINGS RULES:
- These MUST be inferences from actual answers, not invented psychology.
- Frame as "may" — never absolute. "They may need more reassurance than they show." NOT "Deep down they're terrified you'll leave."
- Be specific to THIS couple. BAD: "They may have feelings they haven't shared." GOOD: "They may be more affected by your tone during arguments than they let on."
- Each partner gets exactly 2 items.

GREEN FLAGS RULES:
- 3-5 items. Based on actual positive patterns in answers.
- Short — 3-6 words each.

WATCH-OUTS RULES:
- 1-3 items. Cautious, non-judgmental tone.
- Frame as patterns to be aware of, not accusations.
- NEVER use the "red flag" label. NEVER say "abuser" or "toxic".
- Short — 5-10 words each.`,
  );
}

export function freeScenariosQuestionPrompt(input: TranscriptData): string {
  const { p1, p2 } = partners(input);
  const scenarios = SCENARIO_IDS.map(
    (id) =>
      `    { "id": "${id}", "name": "${SCENARIO_LABELS[id]}", "teaser": "<1 sentence>" }`,
  ).join(",\n");

  return withAnswers(
    input,
    `Generate scenario previews and the final question.

Return JSON:
{
  "scenarios": [
${scenarios}
  ],
  "theQuestion": {
    "question": "<A specific, thought-provoking question tailored to THIS couple's patterns. Not generic. Example: 'If ${p1} stopped being the one to fix things after a fight, would ${p2} step in — or would the silence just grow?'>",
    "hook": "<1 sentence teaser. Example: 'Your answers suggest there may be more to this question than either of you expects.'>"
  }
}

SCENARIO RULES:
- Return all five, in the order given, with these exact ids.
- Each teaser is 1 sentence, specific to this couple (not a generic "this will be challenging").
- Reference their actual dynamics. If they have trust concerns, the long-distance teaser should reflect that.
- Vary the tone — some can be positive ("You may handle this better than most"), some cautious.

THE QUESTION RULES:
- This must be the single most important question for THIS couple based on ALL their answers.
- It must be specific enough that it couldn't apply to just any couple.
- It should create a "that's exactly what we need to talk about" reaction.`,
  );
}

/* ------------------------------- paid: 1-5 -------------------------------- */

/** The radar scores the free report already showed, so paid can't contradict them. */
function radarContext(free: FreeSections): string {
  return free.radar.dimensions
    .map((d) => `${d.id} (${d.name}): ${d.score}/100 — ${d.insight}`)
    .join("\n");
}

export function paidXRayPrompt(input: TranscriptData, free: FreeSections): string {
  const { p1 } = partners(input);

  return withAnswers(
    input,
    `Generate the full deep analysis for all 8 relationship dimensions.

These are the radar scores already shown to them in the free report. Use them exactly — do not recalculate:
${radarContext(free)}

Return JSON:
{
  "fullXRay": [
    {
      "dimensionId": "emotional_connection",
      "dimensionName": "Emotional Connection",
      "score": <same score as the radar>,
      "whatWeSee": "<2-3 sentences — observable pattern>",
      "whatAnswersSuggest": "<2-3 sentences — deeper inference, referencing specific answers>",
      "whereYouDiffer": "<2-3 sentences — how the two partners differ on this>",
      "whatCouldHelp": "<2-3 sentences — specific, actionable, not generic>"
    }
    — and the same four fields for the other 7 dimensions, in the order given above
  ]
}

RULES:
- All 8 dimensions, using the ids above.
- "whatCouldHelp" must be SPECIFIC. BAD: "Try to communicate more openly." GOOD: "When ${p1} goes quiet after a disagreement, try asking 'Are you processing or pulling away?' — it gives them an exit from silence without pressure."
- Reference the ACTUAL answers wherever possible.
- Do not repeat the free report's one-line insight back at them — this is the deeper read.`,
  );
}

export function paidGapsViewPrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate all perception gaps and the "how you see each other" analysis.

The free report told them you found ${free.perceptionGap.totalGapsFound} gaps in total, and already showed this one:
${free.perceptionGap.shown
  .map((gap) => `- ${gap.topic}: ${gap.partner1Said} / ${gap.partner2Said}`)
  .join("\n")}
Cover that one again in more depth, plus the rest.

Return JSON:
{
  "allPerceptionGaps": [
    {
      "topic": "<topic>",
      "partner1Said": "<what they expressed>",
      "partner2Said": "<what they expressed>",
      "whatThisMayMean": "<2-3 sentences>",
      "whyItMatters": "<1-2 sentences>",
      "conversationToHave": "<a specific question they should ask each other about this gap>"
    }
    — ${free.perceptionGap.totalGapsFound} gaps in total
  ],
  "howYouSeeEachOther": {
    "herViewOfHim": "<2-3 sentences — how ${p1} sees ${p2}, based on their answers>",
    "hisViewOfHer": "<2-3 sentences — how ${p2} sees ${p1}>",
    "whatBothMiss": "<2-3 sentences — what neither seems to see about the other>"
  }
}

RULES:
- Only include perception gaps that are REAL — clearly visible in different answers to related questions.
- "conversationToHave" should be a specific question, not generic. "When do you feel least understood by me?" is good. "Talk about your feelings more" is bad.
- In "howYouSeeEachOther", reference what they actually said when describing each other. The field names are legacy: "herViewOfHim" is ${p1}'s view of ${p2}, "hisViewOfHer" is ${p2}'s view of ${p1}, whatever their genders.`,
  );
}

export function paidConflictFuturePrompt(input: TranscriptData): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate the conflict cycle analysis and future projection.

Return JSON:
{
  "conflictFingerprint": {
    "trigger": "<2-3 sentences — what typically starts conflict for this couple>",
    "reaction": "<2-3 sentences — how each partner initially reacts>",
    "escalation": "<2-3 sentences — how it gets worse>",
    "withdrawal": "<2-3 sentences — how they disengage>",
    "aftermath": "<2-3 sentences — what happens after the fight>",
    "pattern": "<2-3 sentences — the overall cycle summarized>",
    "insight": "<2-3 sentences — the deeper reason behind the pattern>"
  },
  "ifNothingChanges": {
    "likelyStrengths": "<2-3 sentences — what will remain strong if they continue as-is>",
    "pressurePoints": "<2-3 sentences — what will likely get worse>",
    "whatBecomesMoreImportant": "<2-3 sentences — what they'll need to address over time>"
  }
}

RULES:
- The conflict fingerprint must describe a CYCLE, not isolated events.
- "insight" should reveal something non-obvious — the WHY behind the pattern.
- "ifNothingChanges" must NOT sound like fortune-telling. Use "may", "likely", "patterns suggest". Frame as projections from current patterns, not predictions.
- Be specific. BAD: "Things might get harder." GOOD: "${p1} may start withdrawing rather than escalating, because escalation hasn't worked — and ${p2} may mistake that silence for peace."`,
  );
}

export function paidLoveAnchorsPrompt(input: TranscriptData, free: FreeSections): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate love style analysis, relationship anchors, and one final unsaid thing per partner.

The free report already showed them these things each partner may not say directly. Do not repeat them:
${p1}: ${free.unsaidThings.partner1.shown.join(" / ")}
${p2}: ${free.unsaidThings.partner2.shown.join(" / ")}

Return JSON:
{
  "loveStyles": {
    "partner1Shows": "<2-3 sentences — how ${p1} tends to show love, based on answers>",
    "partner1FeelsLovedBy": "<2-3 sentences — what makes ${p1} feel loved>",
    "partner2Shows": "<2-3 sentences — how ${p2} tends to show love>",
    "partner2FeelsLovedBy": "<2-3 sentences — what makes ${p2} feel loved>",
    "mismatch": "<2-3 sentences — where these styles don't align, creating friction>"
  },
  "whatKeepsYouTogether": {
    "anchors": ["<short item>", "<short item>", "<short item>"],
    "evidence": "<2-3 sentences — specific evidence from their answers>",
    "isItEnough": "<2-3 sentences — nuanced conclusion, neither dismissive nor blindly optimistic>"
  },
  "unsaidThingsUnlocked": {
    "partner1": "<1-2 sentences — the third and most revealing thing ${p1} may not say directly>",
    "partner2": "<1-2 sentences — the same for ${p2}>"
  }
}

RULES:
- Do NOT use the phrase "love language" or reference the 5 Love Languages framework.
- Frame as "how you show love" and "how you feel loved" — conversational, not clinical.
- "isItEnough" must be nuanced. Not "yes you're fine" and not "no you're doomed". Something like: "Your connection is real, but your unresolved conflict pattern may test it more seriously over time."
- The two unlocked unsaid things are the payoff for a padlock they saw in the free report, so they must be the sharpest of the three — still framed as "may", still grounded in the answers.`,
  );
}

export function paidScenarioResetAnswerPrompt(
  input: TranscriptData,
  free: FreeSections,
): string {
  const { p1, p2 } = partners(input);

  return withAnswers(
    input,
    `Generate full scenario analysis, the action plan, and the final synthesis.

These are the scenario teasers already shown to them. Stay consistent with them:
${free.scenarios.map((s) => `- ${s.id} (${s.name}): ${s.teaser}`).join("\n")}

Return JSON:
{
  "scenarioLab": [
    {
      "id": "living_together",
      "name": "Living Together",
      "compatibility": <number 0-100>,
      "strength": "<1-2 sentences — what would work well>",
      "risk": "<1-2 sentences — what could be difficult>",
      "whatYoudStruggleWith": "<1-2 sentences — the specific friction point>",
      "whatWouldHelp": "<1-2 sentences — specific advice>"
    }
    — and the same fields for the other 4 scenarios, same ids and order as above
  ],
  "sevenDayReset": {
    "day1Question": "<a specific question to ask their partner this week, tailored to their biggest gap>",
    "day2Action": "<a specific action to try, tailored to their conflict pattern>",
    "day3Date": "<a personalized date idea based on their shared interests/dynamic>",
    "whyThisWorks": "<1-2 sentences connecting these to their specific patterns>"
  },
  "theAnswer": {
    "synthesis": "<3-5 sentences — the real assessment of this relationship. Not a score, but a thoughtful conclusion. What's working, what's at risk, and what it comes down to.>",
    "questionToDiscussTonight": "<1 specific question>",
    "conversationStarters": ["<starter 1>", "<starter 2>", "<starter 3>"]
  }
}

SCENARIO RULES:
- The five compatibility scores should differ from each other — these are five different pressures, not one.

7-DAY RESET RULES:
- MUST be specific and personalized. Not "communicate more" or "spend quality time".
- day1Question example: "Ask ${p2}: 'When we argue, what do you wish I did differently in the first 2 minutes?'"
- day2Action example: "The next time ${p1} goes quiet after a disagreement, wait 10 minutes, then say: 'I'm not going anywhere. Take your time, but I'm here when you're ready.'"
- day3Date should reference their dynamic and interests.

THE ANSWER RULES:
- This is the emotional finale. It should read like a wise friend giving a real, honest summary.
- Not overly positive, not doom. Grounded.
- questionToDiscussTonight should be the single most impactful question for them.`,
  );
}
