export type QuestionType = "choice" | "text" | "multi-select" | "blitz" | "scale";

/**
 * "each"     — both partners answer for themselves.
 * "together" — one shared answer.
 * "cross"    — both answer, but *about the other partner*.
 */
export type AnsweredBy = "each" | "together" | "cross";

export interface Choice {
  id: string;
  text: string;
  emoji?: string;
}

export interface BlitzItem {
  id: string;
  statement: string;
}

/** One row of the 7-point scale, labelled at each end. */
export interface ScaleItem {
  id: string;
  left: string;
  right: string;
}

/** Free-text prompts differ per partner so the examples read naturally. */
export interface Placeholder {
  partner1: string;
  partner2: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  subtitle?: string;
  answeredBy: AnsweredBy;
  choices?: Choice[];
  blitzItems?: BlitzItem[];
  scaleItems?: ScaleItem[];
  placeholder?: Placeholder;
  /** multi-select only. Unset means "as many as you like". */
  maxSelections?: number;
}

/** Positions on every scale question — 1 is the left label, 7 the right. */
export const SCALE_POINTS = 7;

export const questions: Question[] = [
  // --- Opener: free text, soft entry ---
  {
    id: "q1",
    type: "text",
    text: 'If a stranger asked: "What\'s your partner really like?" — what would you honestly say?',
    subtitle: 'Don\'t try to answer "right" — just be real',
    answeredBy: "each",
    placeholder: {
      partner1:
        'e.g. "He\'s incredibly thoughtful and always makes me laugh, but sometimes he\'s so stubborn it drives me crazy..."',
      partner2:
        'e.g. "She\'s the most caring person I know, but arguing with her is basically an Olympic sport..."',
    },
  },
  {
    id: "q2",
    type: "text",
    text: 'Finish the sentence: "I love you, but it drives me crazy when you..."',
    answeredBy: "each",
    placeholder: {
      partner1: 'e.g. "...leave your socks everywhere" or "...never admit you\'re wrong"',
      partner2:
        'e.g. "...take forever to get ready" or "...overthink every little thing"',
    },
  },

  // --- How you fight ---
  {
    id: "q3",
    type: "choice",
    text: "You're in the middle of a heated argument. What's your go-to move?",
    answeredBy: "each",
    choices: [
      { id: "a", text: "Raise my voice — I can't help it" },
      { id: "b", text: "Stay calm but I won't back down" },
      { id: "c", text: "Go completely silent" },
      { id: "d", text: "Try to crack a joke or change the subject" },
      { id: "e", text: "Say something I'll probably regret later" },
    ],
  },
  {
    id: "q4",
    type: "multi-select",
    text: "After a fight, how does your partner usually act?",
    subtitle: "Pick all that apply — be honest, not kind",
    answeredBy: "cross",
    choices: [
      { id: "a", text: "Guilt-trips me", emoji: "😔" },
      { id: "b", text: "Gives the silent treatment", emoji: "🧊" },
      { id: "c", text: "Wants to fix it immediately", emoji: "🛠️" },
      { id: "d", text: "Waits for ME to apologize first", emoji: "⏳" },
      { id: "e", text: "Pretends nothing happened", emoji: "😶" },
      { id: "f", text: "Actually apologizes and means it", emoji: "💛" },
    ],
  },
  {
    id: "q5",
    type: "choice",
    text: "Your last real fight — how long did the tension actually last?",
    answeredBy: "together",
    choices: [
      { id: "a", text: "Less than an hour" },
      { id: "b", text: "A few hours" },
      { id: "c", text: "A full day" },
      { id: "d", text: "Multiple days" },
      { id: "e", text: "We're honestly still not over it" },
    ],
  },

  // --- Blitz: boundaries ---
  {
    id: "q6",
    type: "blitz",
    text: "Quick round: Totally Fine or Dealbreaker?",
    subtitle: "Don't overthink — go with your gut",
    answeredBy: "each",
    blitzItems: [
      { id: "b1", statement: "Being close friends with an ex" },
      { id: "b2", statement: "Knowing each other's phone passwords" },
      { id: "b3", statement: "Going on vacation without your partner" },
      { id: "b4", statement: "Venting about your relationship to friends" },
      { id: "b5", statement: "Following/liking attractive people on social media" },
      { id: "b6", statement: "Sharing your live location with each other" },
      { id: "b7", statement: 'Having a "work husband" or "work wife"' },
      { id: "b8", statement: "Keeping a savings account your partner doesn't know about" },
    ],
  },

  // --- Scale: values alignment ---
  {
    id: "q7",
    type: "scale",
    text: "Where do you fall?",
    subtitle: "Slide toward the side that sounds more like you",
    answeredBy: "each",
    scaleItems: [
      { id: "s1", left: "Spontaneous every day", right: "Everything planned" },
      { id: "s2", left: "Career first", right: "Family first" },
      { id: "s3", left: "Save everything", right: "Spend & enjoy now" },
      { id: "s4", left: "Total independence", right: "Do everything together" },
      { id: "s5", left: "Brutally honest", right: "Keep the peace" },
      { id: "s6", left: "Big city energy", right: "Quiet countryside life" },
      { id: "s7", left: "Kids soon", right: "No kids" },
      { id: "s8", left: "Passionate & intense", right: "Calm & stable" },
    ],
  },

  // --- Deep stuff ---
  {
    id: "q8",
    type: "choice",
    text: "How much does your partner actually know about you?",
    answeredBy: "each",
    choices: [
      { id: "a", text: "Everything — even the stuff I'm ashamed of" },
      { id: "b", text: "Most things — I keep a few things private" },
      { id: "c", text: "The basics — I don't do deep emotional sharing" },
      { id: "d", text: "They know the version I want them to see" },
    ],
  },
  {
    id: "q9",
    type: "text",
    text: "If your relationship ended tomorrow — what would you miss the most?",
    subtitle: 'Be specific — not just "everything"',
    answeredBy: "each",
    placeholder: {
      partner1:
        'e.g. "The way we talk for hours about nothing" or "How safe I feel falling asleep next to him"',
      partner2:
        'e.g. "Her laugh when I do something dumb" or "Having someone who actually gets me"',
    },
  },
  {
    id: "q10",
    type: "choice",
    text: "Be honest: have you ever seriously thought about ending this relationship?",
    answeredBy: "each",
    choices: [
      { id: "a", text: "Never — not once" },
      { id: "b", text: "Once, during a rough patch" },
      { id: "c", text: "More than once" },
      { id: "d", text: "More often than I'd admit" },
    ],
  },

  // --- Fun & provocative ---
  {
    id: "q11",
    type: "choice",
    text: "If your relationship was a movie genre — what would it be?",
    answeredBy: "each",
    choices: [
      { id: "a", text: "Romantic comedy", emoji: "🎬" },
      { id: "b", text: "Drama with a happy ending", emoji: "🎭" },
      { id: "c", text: "Thriller — never a dull moment", emoji: "🔥" },
      { id: "d", text: "Documentary — real and raw", emoji: "📹" },
      { id: "e", text: "Horror — love it but it scares me sometimes", emoji: "😅" },
    ],
  },
  {
    id: "q12",
    type: "multi-select",
    text: "If you could secretly upgrade ONE area of your relationship — what would it be?",
    subtitle: "Pick up to 3",
    answeredBy: "each",
    maxSelections: 3,
    choices: [
      { id: "a", text: "More trust", emoji: "🔒" },
      { id: "b", text: "More humor & fun", emoji: "😂" },
      { id: "c", text: "Better sex life", emoji: "🔥" },
      { id: "d", text: "Fewer arguments", emoji: "🕊️" },
      { id: "e", text: "More quality time", emoji: "⏰" },
      { id: "f", text: "More romance & dates", emoji: "💐" },
      { id: "g", text: "Better communication", emoji: "💬" },
      { id: "h", text: "More personal space", emoji: "🧘" },
      { id: "i", text: "Nothing — wouldn't change a thing", emoji: "✅" },
    ],
  },
  {
    id: "q13",
    type: "text",
    text: "One thing your partner does that they have NO idea drives you insane?",
    answeredBy: "each",
    placeholder: {
      partner1: 'e.g. "Chews SO loud" or "Always checks their phone mid-conversation"',
      partner2:
        'e.g. "Takes 3 hours to pick a restaurant" or "Leaves cabinet doors open"',
    },
  },

  // --- Closer ---
  {
    id: "q14",
    type: "choice",
    text: "Where do you honestly see this in 5 years?",
    answeredBy: "each",
    choices: [
      { id: "a", text: "Together for sure — no question" },
      { id: "b", text: "Hopefully together, but who knows" },
      { id: "c", text: "I take it one day at a time" },
      { id: "d", text: "I'm honestly not sure" },
    ],
  },
  {
    id: "q15",
    type: "text",
    text: 'If someone asked: "Why are you two still together?" — what\'s the first thing that comes to mind?',
    answeredBy: "each",
    placeholder: {
      partner1:
        'e.g. "Because nobody else would put up with either of us" or "Because I genuinely can\'t imagine my life without her"',
      partner2:
        'e.g. "Because we\'ve been through too much to quit now" or "Because she makes everything better"',
    },
  },
];
