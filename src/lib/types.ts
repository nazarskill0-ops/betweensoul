export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

export interface PartnerInfo {
  name: string;
  birthday: string;
  gender: Gender | "";
}

export type AnswerValue = string | [string, string];

export interface TestStore {
  partner1: PartnerInfo;
  partner2: PartnerInfo;
  relationshipStart: string;
  email: string;
  answers: Record<string, AnswerValue>;
  reportId: string | null;
  teaser: Teaser | null;
  setPartner1: (data: Partial<PartnerInfo>) => void;
  setPartner2: (data: Partial<PartnerInfo>) => void;
  setRelationshipStart: (date: string) => void;
  setEmail: (email: string) => void;
  setAnswer: (questionId: string, answer: AnswerValue) => void;
  setReport: (reportId: string, teaser: Teaser) => void;
  resetTest: () => void;
}

/** The five scored dimensions. Order here drives the order in the UI. */
export const CATEGORY_IDS = [
  "communication",
  "conflict",
  "trust",
  "intimacy",
  "values",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  communication: "Communication",
  conflict: "Conflict Resolution",
  trust: "Trust & Boundaries",
  intimacy: "Emotional Intimacy",
  values: "Shared Values & Goals",
};

export interface CategoryTeaser {
  id: CategoryId;
  name: string;
  score: number;
  /** One sentence — this is the free hook. */
  headline: string;
}

/** Everything the visitor sees before paying. */
export interface Teaser {
  overallScore: number;
  verdict: string;
  /** One specific line that characterises this couple. */
  coupleLine: string;
  categories: CategoryTeaser[];
  /** 2-3 short topics where they diverged — themes only, no detail. */
  blindSpots: string[];
  /** One line summarising the blitz round, e.g. "You agreed on 6 of 8". */
  flagSummary: string;
}

/** How each partner described the other, and where those descriptions clash. */
export interface SeeEachOther {
  partner1View: string;
  partner2View: string;
  mismatch: string;
}

export interface ConflictDNA {
  /** e.g. "Pursuer-Withdrawer", "Avoidance Loop". */
  pattern: string;
  description: string;
  howItPlaysOut: string;
  advice: string;
}

export type GapSize = "aligned" | "minor" | "significant" | "major";

export const GAP_SIZES: GapSize[] = ["aligned", "minor", "significant", "major"];

export interface ScaleGap {
  topic: string;
  partner1Position: string;
  partner2Position: string;
  gapSize: GapSize;
  comment: string;
}

export type BlitzVerdict = "fine" | "dealbreaker";

export const BLITZ_VERDICTS: BlitzVerdict[] = ["fine", "dealbreaker"];

export interface BlitzSplit {
  statement: string;
  partner1: BlitzVerdict;
  partner2: BlitzVerdict;
  insight: string;
}

export interface GapMap {
  scaleGaps: ScaleGap[];
  /** Only the statements they disagreed on. */
  blitzSplits: BlitzSplit[];
  overallInsight: string;
}

export interface AfraidToLose {
  partner1: string;
  partner2: string;
  alignment: string;
}

export interface UncomfortableTruth {
  headline: string;
  explanation: string;
}

export interface TitledItem {
  title: string;
  detail: string;
}

/** The paid report. The teaser fields are not repeated here. */
export interface FullReport {
  seeEachOther: SeeEachOther;
  conflictDNA: ConflictDNA;
  gapMap: GapMap;
  afraidToLose: AfraidToLose;
  uncomfortableTruth: UncomfortableTruth;
  /** Exactly three. */
  gettingRight: TitledItem[];
  actionPlan: TitledItem[];
  conversationStarters: string[];
}

export interface Analysis {
  teaser: Teaser;
  full: FullReport;
}

export interface StoredReport {
  id: string;
  createdAt: number;
  paid: boolean;
  email: string;
  partner1Name: string;
  partner2Name: string;
  analysis: Analysis;
}
