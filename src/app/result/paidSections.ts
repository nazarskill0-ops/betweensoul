/**
 * The nine paid sections, in one place.
 *
 * Each section component already knows its own heading and its own long teaser
 * — the copy that sits under the padlock and argues for the purchase. What
 * lives here is the copy that has to be written *about* a section from
 * somewhere else: the button on the blurred card, and the line in the modal's
 * list. Both are read by code that has no business importing nine section
 * components to ask them what they are called.
 *
 * `cta` is deliberately about the section and never about the price. Nine cards
 * each reading "Unlock Full Report — $9.99" was the problem this replaces:
 * repeated down a page, one price reads as nine prices.
 *
 * The titles are written to be said out loud rather than filed under a
 * heading — "Would You Survive…?" rather than "Life Scenario Lab". The reader
 * decides whether to pay from this list, and a clinical label reads as a table
 * of contents for a document rather than as a thing they want to know.
 */

export const PAID_SECTION_IDS = [
  "unsaidThings",
  "allPerceptionGaps",
  "conflictFingerprint",
  "loveStyles",
  "howYouSeeEachOther",
  "scenarioLab",
  "ifNothingChanges",
  "whatKeepsYouTogether",
  "theAnswer",
] as const;

export type PaidSectionId = (typeof PAID_SECTION_IDS)[number];

export interface PaidSectionMeta {
  emoji: string;
  /** The section's own heading, for the modal's list. */
  title: string;
  /** The button on the blurred card. Says what is inside, never the price. */
  cta: string;
  /** One line in the modal, trailing off rather than finishing. */
  modalTeaser: string;
}

export const PAID_SECTIONS: Record<PaidSectionId, PaidSectionMeta> = {
  unsaidThings: {
    emoji: "🙊",
    title: "Things They'd Never Say To Your Face",
    cta: "See all 3 things 🔒",
    modalTeaser: "All three things neither of you says out loud…",
  },
  allPerceptionGaps: {
    emoji: "🪞",
    title: "Every Perception Gap",
    cta: "See where you two disagree 🔒",
    modalTeaser: "Every place you see the relationship differently…",
  },
  conflictFingerprint: {
    emoji: "🧬",
    title: "Your Conflict Fingerprint",
    cta: "Unlock your conflict style 🔒",
    modalTeaser: "The argument you keep having, stage by stage…",
  },
  loveStyles: {
    emoji: "💞",
    title: "How You Show Love vs How You Feel Loved",
    cta: "See what they need most 🔒",
    modalTeaser: "Where the love you give misses the love they need…",
  },
  howYouSeeEachOther: {
    emoji: "👀",
    title: "How You Really See Each Other",
    cta: "See how they really see you 🔒",
    modalTeaser: "What you are both missing about each other…",
  },
  scenarioLab: {
    emoji: "🧪",
    title: "Would You Survive…?",
    cta: "See how you'd handle each one 🔒",
    modalTeaser: "All five futures, rated — moving in, distance, kids…",
  },
  ifNothingChanges: {
    emoji: "⏳",
    title: "If Nothing Changes…",
    cta: "See where this is heading 🔒",
    modalTeaser: "Six months, twelve months, and the turning point…",
  },
  whatKeepsYouTogether: {
    emoji: "❤️",
    title: "What's Actually Keeping You Together?",
    cta: "See what's really holding you 🔒",
    modalTeaser: "Love, comfort, habit or fear — named honestly…",
  },
  theAnswer: {
    emoji: "🕯️",
    title: "The Answer",
    cta: "Read our honest assessment 🔒",
    modalTeaser: "Whether you are actually a good match, said plainly…",
  },
};

/** The modal's list, in the order the sections appear in the report. */
export const PAID_SECTION_LIST = PAID_SECTION_IDS.map((id) => ({
  id,
  ...PAID_SECTIONS[id],
}));
