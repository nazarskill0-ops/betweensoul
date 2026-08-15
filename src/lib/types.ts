export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

export interface PartnerInfo {
  name: string;
  birthday: string;
  gender: Gender | "";
}

export type AnswerValue = string | [string, string];

/** Everything a generation pass needs to replay the test. */
export interface TranscriptData {
  partner1: PartnerInfo;
  partner2: PartnerInfo;
  relationshipStart: string;
  answers: Record<string, AnswerValue>;
}

/* ------------------------------ fixed lists ------------------------------- */

/**
 * The eight radar dimensions. Ids, order and labels are fixed here rather than
 * taken from the model, so a run that renames or reorders them still lands in
 * the right slot on the page.
 */
export const DIMENSION_IDS = [
  "emotional_connection",
  "communication",
  "trust",
  "chemistry",
  "conflict",
  "shared_future",
  "independence",
  "playfulness",
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  emotional_connection: "Emotional Connection",
  communication: "Communication",
  trust: "Trust",
  chemistry: "Chemistry",
  conflict: "Conflict",
  shared_future: "Shared Future",
  independence: "Independence",
  playfulness: "Playfulness",
};

/** The five "what happens if" scenarios, previewed free and analysed in paid. */
export const SCENARIO_IDS = [
  "living_together",
  "long_distance",
  "financial_stress",
  "major_life_change",
  "having_a_child",
] as const;

/**
 * How many of the five the free report shows, taken off the front of the list.
 *
 * All five are generated — the paid scenario lab needs them, and the two that
 * stay shut have to be real before they can be sold. This is only how far down
 * the list the free page reads.
 */
export const FREE_SCENARIO_COUNT = 3;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  living_together: "Living Together",
  long_distance: "Long Distance",
  financial_stress: "Financial Stress",
  major_life_change: "Major Life Change",
  having_a_child: "Having a Child",
};

/**
 * The five slider questions. The model only supplies positions — the wording is
 * ours, so it can't drift between reports.
 *
 * Five distinct axes rather than six overlapping ones: the old list asked twice
 * about who withdraws from a fight and twice about who softens first, which
 * produced pairs of near-identical bars. These are five different things —
 * needing, wanting, carrying, starting, planning.
 */
export const SLIDER_QUESTIONS = [
  "Who needs more reassurance?",
  "Who needs more personal space?",
  "Who carries more of the emotional labor?",
  "Who starts the hard conversations?",
  "Who thinks further ahead about the future?",
] as const;

/**
 * How many sliders the free report shows, taken off the front of the list.
 *
 * All five are generated in the same request either way; this is only how far
 * down the free page reads before the padlock. The remaining three open with
 * the report, which makes this the one place where paying adds to a section the
 * free half already showed rather than starting a new one.
 */
export const FREE_SLIDER_COUNT = 2;

/** The dynamic is picked from this list, not invented. */
export const COUPLE_DYNAMICS: { name: string; gist: string }[] = [
  { name: "The Anchor & The Spark", gist: "one brings stability, the other brings spontaneity" },
  { name: "The Dreamers", gist: "both idealistic and future-focused, sometimes at the expense of present issues" },
  { name: "The Teammates", gist: "practical, aligned, efficient — but possibly lacking passion or surprise" },
  { name: "The Opposites", gist: "fundamentally different temperaments that create both attraction and friction" },
  { name: "The Best Friends", gist: "deep comfort and familiarity, but possibly missing romantic intensity" },
  { name: "The Explorers", gist: "both crave novelty and growth, but may struggle with consistency" },
  { name: "The Balancers", gist: "naturally complement each other's weaknesses, but may take each other for granted" },
  { name: "Fire & Ice", gist: "one is emotionally expressive, the other reserved — tension and magnetism" },
  { name: "The Safe Haven", gist: "deep security and trust, but possibly avoiding hard conversations" },
  { name: "The Challengers", gist: "both strong-willed, creating growth but also power struggles" },
  { name: "The Mirror", gist: "very similar personalities, which creates understanding but also blind spots" },
  { name: "The Protector & The Free Spirit", gist: "one is cautious and caring, the other independent and adventurous" },
];

/* ------------------------------ free sections ----------------------------- */

export interface CoupleScore {
  overall: number;
  connection: number;
  stability: number;
  chemistry: number;
  insight: string;
}

/**
 * The archetype and one short paragraph. What used to sit here as well — what
 * works, where it gets difficult — was the free report explaining the couple to
 * themselves for free. The name is the shareable part; the explanation is what
 * the full report is for.
 */
export interface CoupleDynamic {
  name: string;
  description: string;
}

export interface RadarDimension {
  id: DimensionId;
  name: string;
  score: number;
  /**
   * Not rendered on the free page any more — eight paragraphs under eight
   * scores was most of the reason the free report read as finished. It is still
   * generated because the paid X-ray is handed these lines as the reading it
   * has to deepen rather than repeat. See `radarContext` in prompts.ts.
   */
  insight: string;
}

export interface Radar {
  dimensions: RadarDimension[];
}

/** One line each, side by side. The "why" behind them is the paid X-ray. */
export interface Highlight {
  dimensionId: DimensionId;
  dimensionName: string;
  score: number;
  explanation: string;
}

export interface Slider {
  question: string;
  /** 0 = fully partner 1, 50 = even, 100 = fully partner 2. */
  partner1Position: number;
}

export interface PerceptionGapPreview {
  topic: string;
  partner1Said: string;
  partner2Said: string;
  aiComment: string;
}

export interface PerceptionGap {
  shown: PerceptionGapPreview[];
  /** How many exist in total — the tease for the paid section. */
  totalGapsFound: number;
}

/**
 * One of the three things, shown; the other two are the paid
 * `unsaidThingsUnlocked`, one per partner.
 *
 * The free half used to show two per partner and lock a third each, which meant
 * four of the six most personal lines in the report were given away. Now the
 * page shows one — the least raw of the three, and it says which partner it is
 * about so it can be coloured like everything else.
 */
export interface UnsaidThings {
  about: "partner1" | "partner2";
  shown: string;
  /** The vague line over the two locked rows. Names no one. */
  lockedTeaser: string;
}

export interface Flags {
  greenFlags: string[];
  watchOuts: string[];
}

/**
 * How the scenario reads at a glance, so three futures can be scanned in the
 * time the old paragraph teasers took to read one.
 */
export type ScenarioStatus = "good" | "watch" | "risk";

export interface ScenarioPreview {
  id: ScenarioId;
  name: string;
  status: ScenarioStatus;
  teaser: string;
}

/** Sections 1-9, generated by Haiku the moment the test is submitted. */
export interface FreeSections {
  coupleScore: CoupleScore;
  coupleDynamic: CoupleDynamic;
  radar: Radar;
  biggestStrength: Highlight;
  biggestTension: Highlight;
  sliders: Slider[];
  perceptionGap: PerceptionGap;
  unsaidThings: UnsaidThings;
  flags: Flags;
  scenarios: ScenarioPreview[];
}

/* ------------------------------ paid sections ----------------------------- */

/**
 * Which partner a paid card is about. Drives the colour it is shown in, the
 * same way the free sections are coloured.
 */
export type PartnerRef = "partner1" | "partner2";

/**
 * All three of them, each with the reason it matters.
 *
 * The free page reveals one of the three and blurs the other two; this is the
 * whole set, the revealed one included and deepened rather than skipped — a
 * buyer who paid to see "all 3" and got 2 has been shortchanged on the wording
 * of the padlock they bought.
 */
export interface UnsaidThingFull {
  about: PartnerRef;
  thing: string;
  whyThisMatters: string;
}

export interface FullPerceptionGap {
  topic: string;
  partner1Said: string;
  partner2Said: string;
  whyItMatters: string;
}

export interface HowYouSeeEachOther {
  /** Two or three short lines each, not a paragraph. */
  partner1SeesPartner2: string[];
  partner2SeesPartner1: string[];
  surprise: string;
}

/**
 * The loop, in the order it runs. `repeat` is what closes it — whether they
 * reconcile, and what that costs — and is the step that makes the diagram a
 * cycle rather than a list of five bad moments.
 */
export interface ConflictFingerprint {
  trigger: string;
  reaction: string;
  escalation: string;
  withdrawal: string;
  aftermath: string;
  repeat: string;
}

/** Low / moderate / high, for scenarios and for the strain projection. */
export type RiskLevel = "low" | "moderate" | "high";

/**
 * A projection, deliberately without a number.
 *
 * Competitors put a breakup percentage here. A percentage implies a model that
 * was fitted to outcomes, and this one was fitted to fifteen questions answered
 * on a phone — so the section says six months, twelve months, and what would
 * change the direction, and carries a named risk level instead of a fake
 * decimal.
 */
export interface IfNothingChanges {
  sixMonths: string;
  twelveMonths: string;
  turningPoint: string;
  strain: RiskLevel;
}

export interface LoveStyles {
  partner1Shows: string;
  partner1FeelsLovedBy: string;
  partner1Gap: string;
  partner2Shows: string;
  partner2FeelsLovedBy: string;
  partner2Gap: string;
}

export interface WhatKeepsYouTogether {
  /** The single strongest force, named in a few words. */
  mainForce: string;
  alsoHolding: string[];
  watchOutFor: string;
  isItEnough: string;
}

export interface ScenarioAnalysis {
  id: ScenarioId;
  name: string;
  risk: RiskLevel;
  analysis: string;
}

export interface TheAnswer {
  /** "Yes, but…" / "Yes, and…" / "It's complicated…" — the headline verdict. */
  shortAnswer: string;
  verdict: string;
  biggestOpportunity: string;
  conversationToHave: string;
}

/** The nine paid sections, generated by Sonnet once the payment is confirmed. */
export interface PaidSections {
  unsaidThings: UnsaidThingFull[];
  allPerceptionGaps: FullPerceptionGap[];
  conflictFingerprint: ConflictFingerprint;
  loveStyles: LoveStyles;
  howYouSeeEachOther: HowYouSeeEachOther;
  scenarioLab: ScenarioAnalysis[];
  ifNothingChanges: IfNothingChanges;
  whatKeepsYouTogether: WhatKeepsYouTogether;
  theAnswer: TheAnswer;
}

/* -------------------------------- storage --------------------------------- */

/**
 * `pending` — the paid sections have not been generated (whether or not the
 *             transaction has been paid).
 * `ready`   — `paidSections` is populated.
 */
export type PaidStatus = "pending" | "ready";

export interface CouplescanReport {
  id: string;
  /** Set by the Paddle webhook. The only thing that authorises a paid run. */
  paid: boolean;
  paidStatus: PaidStatus;
  partner1Name: string;
  partner2Name: string;
  /** ISO 8601. Also drives the 24h expiry — see reportStore. */
  createdAt: string;
  /** Kept so the paid pass can replay the test without the client. */
  answers: TranscriptData;
  free: FreeSections;
  paidSections: PaidSections | null;
}

/* --------------------------------- client --------------------------------- */

/** What each partner has picked so far on the question currently on screen. */
export interface PartnerAnswers {
  p1: string;
  p2: string;
}

/**
 * The questions page's working copy, keyed by question id — or
 * `${questionId}_${itemId}` for the blitz round and the scale question, which
 * hold one answer per sub-item.
 *
 * `answers` below is the committed version, written when a question is left
 * and shaped the way the API expects. This is the half-filled state in between,
 * kept so that going Back — or reloading the page — restores what was picked
 * rather than a blank question.
 */
export type DraftAnswers = Record<string, PartnerAnswers>;

export interface TestStore {
  partner1: PartnerInfo;
  partner2: PartnerInfo;
  relationshipStart: string;
  /**
   * Distinguishes this run of the test from any other, and nothing more.
   *
   * The report id is a hash of the submission so a client retry lands on the
   * report it already made rather than billing a second one. That hash used to
   * include the buyer's email, which was also what kept two different couples
   * with the same names and the same answers off each other's report — the
   * second would have inherited the first one's paid sections. With the email
   * gone, this is what does that job: random per run, stable across retries.
   */
  submissionId: string;
  answers: Record<string, AnswerValue>;
  /** Which question the reader is on, 0-based. */
  questionIndex: number;
  drafts: DraftAnswers;
  reportId: string | null;
  teaser: FreeSections | null;
  setPartner1: (data: Partial<PartnerInfo>) => void;
  setPartner2: (data: Partial<PartnerInfo>) => void;
  setRelationshipStart: (date: string) => void;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  setQuestionIndex: (index: number) => void;
  updateDraft: (key: string, update: (current: PartnerAnswers) => PartnerAnswers) => void;
  setReport: (reportId: string, teaser: FreeSections) => void;
  resetTest: () => void;
  /**
   * Drops the saved copy without touching the live store, so the tab that just
   * submitted keeps working and the next reload starts clean.
   */
  clearSaved: () => void;
}
