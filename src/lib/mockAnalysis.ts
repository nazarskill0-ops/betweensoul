import { CATEGORY_LABELS, FreeReport, PaidReport } from "@/lib/types";

/**
 * Canned reports for local UI work — no Claude call, no API key, no cost.
 * Enabled by MOCK_ANALYSIS=1 (dev only; see src/app/api/analyze/route.ts).
 *
 * Deliberately opinionated content: uneven scores and a real asymmetry, so the
 * result page is exercised the way a genuine report would exercise it.
 */
export function buildMockFreeReport(p1: string, p2: string): FreeReport {
  return {
    overallScore: 72,
    verdict: "Warm, but conflict-avoidant.",
    hiddenDynamic: {
      type: "The Pursuer & The Vault",
      description: `${p1} moves toward a fight to finish it; ${p2} closes to contain it. Neither reads the other's move as an attempt to protect the relationship, so every disagreement runs longer than the thing that started it. It's a loop, not a character flaw — which is why it's fixable.`,
    },
    categories: [
      {
        id: "communication",
        name: CATEGORY_LABELS.communication,
        score: 78,
        headline:
          "You talk constantly, but almost never about the one thing that's actually bothering you.",
      },
      {
        id: "conflict",
        name: CATEGORY_LABELS.conflict,
        score: 58,
        headline: `${p1} gets louder, ${p2} goes silent — and neither reads the other's move as an attempt to fix it.`,
      },
      {
        id: "trust",
        name: CATEGORY_LABELS.trust,
        score: 84,
        headline:
          "Neither of you doubts the other's loyalty, but you draw the line around exes in very different places.",
      },
      {
        id: "intimacy",
        name: CATEGORY_LABELS.intimacy,
        score: 66,
        headline: `${p2} keeps the heaviest things back, and ${p1} has noticed without saying so.`,
      },
      {
        id: "values",
        name: CATEGORY_LABELS.values,
        score: 61,
        headline:
          "One of you is certain about five years from now and the other is hedging.",
      },
    ],
    flagSummary:
      "You agreed on 9 out of 12 boundaries — but the 3 you didn't are the ones that start real fights.",
  };
}

export function buildMockPaidReport(p1: string, p2: string): PaidReport {
  return {
    biggestSurprise: {
      insight: `The thing you fight about isn't the thing you disagree about. On the questions that actually decide a life — money, kids, where you live — you're closer than most couples six years in. Every serious argument you described is about *pace*: how fast to resolve, how much space to take, how long silence is allowed to last. You've been treating a rhythm problem like a values problem, which is why it never resolves — you keep negotiating the wrong thing.`,
    },
    seeEachOther: {
      partner1View: `${p1} reached for character first — "steady and funny", the person who can make her laugh mid-argument. Then, immediately, the thing she can't reach: him "disappearing into himself". She describes someone she admires and can't always get to.`,
      partner2View: `${p2} described ${p1} as the most loyal person he knows and followed it with "the most intense." His complaint isn't about who she is; it's about timing — old grievances arriving in the middle of small disagreements.`,
      dynamic: `Both of you led with something genuinely admiring before naming a problem. That's rarer than it sounds. But notice the shape: she describes what she can't reach, he describes what arrives too fast. You're each describing the same moment from opposite ends of it.`,
    },
    biggestMisunderstanding: {
      partner1Thinks: `${p1} thinks: "If I keep pushing, we'll finish this tonight and it'll be over."`,
      partner2Experiences: `${p2} experiences: being cornered — and the more she pushes, the more certain he becomes that saying anything now will make it permanent.`,
    },
    conflictDNA: {
      pattern: "Pursue, close, wait",
      trigger: `Almost never the stated subject. It starts when ${p1} reads a delay as disinterest — a slow reply, a shrug, a "later" — and moves to close the gap immediately.`,
      escalation: `She raises the volume to keep the conversation alive. He reads volume as danger and stops talking, which she reads as proof he doesn't care, which raises the volume again. Neither is escalating on purpose; each is responding to the other's escalation.`,
      aftermath: `You said the last real fight ran multiple days. That's the loop at full length — long enough that the original disagreement stops mattering and the silence becomes the thing you're fighting about.`,
      insight: `Underneath it, you want the same thing: for the relationship to be okay by the end of the night. You've just chosen opposite methods, and each method looks like abandonment to the other person.`,
    },
    howYouLove: {
      partner1: `${p1} loves by closing distance. She checks in, she pushes for the conversation, she wants the thing resolved before sleep. What she needs back is responsiveness — not agreement, just evidence that she's been heard in the moment she needs it. Silence reads to her as the relationship going quiet, not as someone taking a breath.`,
      partner2: `${p2} loves by staying steady. He absorbs, he doesn't escalate, he keeps the temperature down because he thinks that's what protects them. What he needs back is time — a short delay before he has to have words for something. He said he'd miss being noticed before he says anything; that's the whole request in one line.`,
      friction: `Her care arrives as pressure; his care arrives as absence. The cruel part is that both of you are doing the loving thing, in the exact form the other person can't receive it.`,
    },
    ifNothingChanges: {
      prediction: `In six to twelve months you'll probably be arguing less. Not because anything improved — because ${p1} will stop bringing things up. She'll decide it costs more than it's worth, and the house will get quiet in the way that looks like peace from the outside.`,
      why: `He's already thought about leaving more than once; she's answered "once, during a rough patch". She's certain about five years from now and he said "hopefully, but who knows." She's the one still investing in repair, so she's the one with something to withdraw — and multiple-day fights are exactly the cost that teaches someone to stop starting them.`,
    },
    whatKeepsYouTogether: {
      core: `Neither of you has ever made the other person the enemy. Six years in, with a conflict pattern this stuck, both of you still described the other as someone worth admiring — and did it before mentioning a single complaint.`,
      evidence: `"Steady and funny." "The most loyal person I know." Neither of you vents about the relationship to friends, so the problems have stayed yours to solve rather than becoming a story other people have opinions about. That's the thing holding this up, and it's still fully intact.`,
    },
    biggestQuestion: {
      question: `What would each of you have to trust about the other for a fight to safely end unfinished?`,
      conversationStarters: [
        "When you go quiet, what are you actually protecting — me, yourself, or the argument?",
        "What did you mean by “hopefully together, but who knows”?",
        "What would I have to stop doing for the next fight to end in an hour instead of three days?",
      ],
    },
  };
}
