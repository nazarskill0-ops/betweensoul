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

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  living_together: "Living Together",
  long_distance: "Long Distance",
  financial_stress: "Financial Stress",
  major_life_change: "Major Life Change",
  having_a_child: "Having a Child",
};

/**
 * The six slider questions. The model only supplies positions — the wording is
 * ours, so it can't drift between reports.
 */
export const SLIDER_QUESTIONS = [
  "Who needs more reassurance?",
  "Who needs more personal space?",
  "Who is more likely to step away during conflict?",
  "Who falls back into old habits faster?",
  "Who makes the first move after a fight?",
  "Who is more secretly romantic?",
] as const;

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

export interface CoupleDynamic {
  name: string;
  description: string;
  whatWorks: string;
  whereItGetsDifficult: string;
}

export interface RadarDimension {
  id: DimensionId;
  name: string;
  score: number;
  insight: string;
}

export interface Radar {
  dimensions: RadarDimension[];
  /** How two or three dimensions relate — the part that shows real reading. */
  interconnection: string;
}

export interface BiggestStrength {
  dimensionId: DimensionId;
  dimensionName: string;
  score: number;
  explanation: string;
  whyItMatters: string;
}

export interface BiggestTension {
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

export interface UnsaidThings {
  partner1: { shown: string[]; hasLocked: boolean };
  partner2: { shown: string[]; hasLocked: boolean };
}

export interface Flags {
  greenFlags: string[];
  watchOuts: string[];
}

export interface ScenarioPreview {
  id: ScenarioId;
  name: string;
  teaser: string;
}

export interface TheQuestion {
  question: string;
  hook: string;
}

/** Sections 1-11, generated by Haiku the moment the test is submitted. */
export interface FreeSections {
  coupleScore: CoupleScore;
  coupleDynamic: CoupleDynamic;
  radar: Radar;
  biggestStrength: BiggestStrength;
  biggestTension: BiggestTension;
  sliders: Slider[];
  perceptionGap: PerceptionGap;
  unsaidThings: UnsaidThings;
  flags: Flags;
  scenarios: ScenarioPreview[];
  theQuestion: TheQuestion;
}

/* ------------------------------ paid sections ----------------------------- */

export interface XRayDimension {
  dimensionId: DimensionId;
  dimensionName: string;
  score: number;
  whatWeSee: string;
  whatAnswersSuggest: string;
  whereYouDiffer: string;
  whatCouldHelp: string;
}

export interface FullPerceptionGap {
  topic: string;
  partner1Said: string;
  partner2Said: string;
  whatThisMayMean: string;
  whyItMatters: string;
  conversationToHave: string;
}

export interface HowYouSeeEachOther {
  herViewOfHim: string;
  hisViewOfHer: string;
  whatBothMiss: string;
}

export interface ConflictFingerprint {
  trigger: string;
  reaction: string;
  escalation: string;
  withdrawal: string;
  aftermath: string;
  pattern: string;
  insight: string;
}

export interface IfNothingChanges {
  likelyStrengths: string;
  pressurePoints: string;
  whatBecomesMoreImportant: string;
}

export interface LoveStyles {
  partner1Shows: string;
  partner1FeelsLovedBy: string;
  partner2Shows: string;
  partner2FeelsLovedBy: string;
  mismatch: string;
}

export interface WhatKeepsYouTogether {
  anchors: string[];
  evidence: string;
  isItEnough: string;
}

export interface ScenarioAnalysis {
  id: ScenarioId;
  name: string;
  compatibility: number;
  strength: string;
  risk: string;
  whatYoudStruggleWith: string;
  whatWouldHelp: string;
}

export interface SevenDayReset {
  day1Question: string;
  day2Action: string;
  day3Date: string;
  whyThisWorks: string;
}

export interface TheAnswer {
  synthesis: string;
  questionToDiscussTonight: string;
  conversationStarters: string[];
}

/** Sections 12-21, generated by Sonnet once the payment is confirmed. */
export interface PaidSections {
  fullXRay: XRayDimension[];
  allPerceptionGaps: FullPerceptionGap[];
  howYouSeeEachOther: HowYouSeeEachOther;
  conflictFingerprint: ConflictFingerprint;
  ifNothingChanges: IfNothingChanges;
  loveStyles: LoveStyles;
  whatKeepsYouTogether: WhatKeepsYouTogether;
  scenarioLab: ScenarioAnalysis[];
  sevenDayReset: SevenDayReset;
  theAnswer: TheAnswer;
  /**
   * The third "thing they may not say", one per partner.
   *
   * Free section 8 shows two per partner and marks a third as locked. Nothing
   * in sections 12-21 pays that promise off, so it is generated here — without
   * it the buyer unlocks the report and the padlock is still there.
   */
  unsaidThingsUnlocked: { partner1: string; partner2: string };
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
