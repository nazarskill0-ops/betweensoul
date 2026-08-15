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
  /**
   * Multi-select only: an answer that rules the others out.
   *
   * "None of these" alongside three of these is not an answer, it is two
   * answers — and the model reading the transcript has no way to tell which one
   * the person meant. Picking one of these clears the rest; picking anything
   * else clears this.
   */
  exclusive?: boolean;
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
    type: "multi-select",
    text: "You're in the middle of a heated argument. What's your go-to move?",
    subtitle: "Pick up to 3 — most people do more than one",
    answeredBy: "each",
    maxSelections: 3,
    choices: [
      { id: "a", text: "Become more emotional — I can't help it" },
      { id: "b", text: "Stay calm but I won't back down" },
      { id: "c", text: "Go completely silent" },
      { id: "d", text: "Try to crack a joke or change the subject" },
      { id: "e", text: "Say something I'll probably regret later" },
      // The escape hatch. Without it the question forces a confession nobody
      // recognises, and "go completely silent" was collecting everyone who
      // simply did not see themselves in the list — which is a different
      // person from someone who genuinely goes quiet.
      { id: "f", text: "None of these sound like me", exclusive: true },
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
      { id: "g", text: "Needs space first, then talks", emoji: "🚪" },
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
      // b7 was 'Having a "work husband" or "work wife"'. The phrase means
      // something different to everyone who reads it, so Fine-or-Dealbreaker
      // was measuring how people interpret a slang term rather than where
      // their boundary is. The id is retired rather than reused.
      { id: "b8", statement: "Keeping a savings account your partner doesn't know about" },
      { id: "b9", statement: "Sleeping in separate beds" },
      { id: "b10", statement: "Keeping an opposite-sex best friend" },
      { id: "b11", statement: "Watching porn" },
      { id: "b12", statement: "Moving abroad for work" },
    ],
  },

  // --- Scale: values alignment ---
  {
    id: "q7",
    type: "scale",
    text: "Where do you fall?",
    // The middle four points carried no meaning at all: the ends were labelled
    // and everything between them was a bare number, so a 4 could be "both",
    // "neither" or "I'd rather not say". Naming the centre once here fixes it
    // for all eight rows, which is cheaper than a label under every one.
    subtitle: "Slide toward the side that sounds more like you — 4 is dead centre",
    answeredBy: "each",
    scaleItems: [
      { id: "s1", left: "Spontaneous every day", right: "Everything planned" },
      { id: "s2", left: "Career first", right: "Family first" },
      { id: "s3", left: "Save everything", right: "Spend & enjoy now" },
      { id: "s4", left: "Total independence", right: "Do everything together" },
      { id: "s5", left: "Brutally honest", right: "Keep the peace" },
      { id: "s6", left: "Big city energy", right: "Quiet countryside life" },
      // "Want kids / Don't want kids" made the middle unreadable — a 4 looked
      // like a contradiction rather than "still deciding".
      { id: "s7", left: "Definitely want kids", right: "Definitely don't" },
      // Without the last word this could be read as being about sex, about
      // arguing, or about temperament. It is about none of those specifically.
      {
        id: "s8",
        left: "Passionate & intense energy",
        right: "Calm & stable energy",
      },
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
      { id: "e", text: "I don't even know myself that well" },
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
      { id: "e", text: "I don't know" },
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
      { id: "f", text: "Adventure — we're building something together", emoji: "🧭" },
    ],
  },
  {
    id: "q12",
    type: "multi-select",
    text: "If you could secretly upgrade ONE area of your relationship — what would it be?",
    subtitle: "Pick up to 5",
    answeredBy: "each",
    maxSelections: 5,
    choices: [
      { id: "a", text: "More trust", emoji: "🔒" },
      { id: "b", text: "More humor & fun", emoji: "😂" },
      { id: "c", text: "Better sex life", emoji: "🔥" },
      { id: "d", text: "Fewer arguments", emoji: "🕊️" },
      { id: "e", text: "More quality time", emoji: "⏰" },
      { id: "f", text: "More romance & dates", emoji: "💐" },
      { id: "g", text: "Better communication", emoji: "💬" },
      { id: "h", text: "More personal space", emoji: "🧘" },
      { id: "i", text: "Feeling understood", emoji: "🫂" },
      {
        id: "j",
        text: "Nothing — wouldn't change a thing",
        emoji: "✅",
        exclusive: true,
      },
    ],
  },
  {
    id: "q13",
    type: "text",
    // This used to ask for the thing their partner does that drives them
    // insane, which is q2 with different wording — two of fifteen questions
    // spent on the same complaint, and the second one read as being asked
    // twice whether you are annoyed. This asks for the opposite thing: not
    // what they want their partner to stop, but what they want them to know.
    text: "What's one thing you wish your partner understood about you without having to explain?",
    answeredBy: "each",
    placeholder: {
      partner1:
        'e.g. "That I need silence after work" or "That asking me \'what\'s wrong\' makes it worse"',
      partner2:
        'e.g. "That I\'m not upset, I\'m just thinking" or "That I need a plan before I can relax"',
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
