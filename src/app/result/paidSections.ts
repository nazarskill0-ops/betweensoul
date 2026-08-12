/**
 * The ten paid sections, in one place.
 *
 * Each section component already knows its own heading and its own long teaser
 * — the copy that sits under the padlock and argues for the purchase. What
 * lives here is the copy that has to be written *about* a section from
 * somewhere else: the button on the blurred card, and the line in the modal's
 * list. Both are read by code that has no business importing ten section
 * components to ask them what they are called.
 *
 * `cta` is deliberately about the section and never about the price. Ten cards
 * each reading "Unlock Full Report — $9.99" was the problem this replaces:
 * repeated ten times down a page, one price reads as ten prices.
 */

export const PAID_SECTION_IDS = [
  "fullXRay",
  "allPerceptionGaps",
  "conflictFingerprint",
  "loveStyles",
  "howYouSeeEachOther",
  "scenarioLab",
  "ifNothingChanges",
  "whatKeepsYouTogether",
  "sevenDayReset",
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
  fullXRay: {
    emoji: "🩻",
    title: "Full Relationship X-Ray",
    cta: "See all 8 dimensions in depth 🔒",
    modalTeaser: "What your answers reveal across all 8 dimensions…",
  },
  allPerceptionGaps: {
    emoji: "🪞",
    title: "All Perception Gaps",
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
    title: "Life Scenario Lab",
    cta: "See how you'd handle each one 🔒",
    modalTeaser: "All five futures, scored — moving in, distance, kids…",
  },
  ifNothingChanges: {
    emoji: "⏳",
    title: "If Nothing Changes",
    cta: "See where this is heading 🔒",
    modalTeaser: "How your relationship evolves if nothing shifts…",
  },
  whatKeepsYouTogether: {
    emoji: "💚",
    title: "What Keeps You Together (And Is It Enough?)",
    cta: "See what's really holding you 🔒",
    modalTeaser: "Your strongest anchors — and whether they hold…",
  },
  sevenDayReset: {
    emoji: "🗓️",
    title: "Your 7-Day Relationship Reset",
    cta: "Discover your growth areas 🔒",
    modalTeaser: "One question, one thing to try, one date to go on…",
  },
  theAnswer: {
    emoji: "🕯️",
    title: "The Answer",
    cta: "Read our honest assessment 🔒",
    modalTeaser: "Where you actually stand, said plainly…",
  },
};

/** The modal's list, in the order the sections appear in the report. */
export const PAID_SECTION_LIST = PAID_SECTION_IDS.map((id) => ({
  id,
  ...PAID_SECTIONS[id],
}));
