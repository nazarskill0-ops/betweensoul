import { Analysis, CATEGORY_LABELS } from "@/lib/types";

/**
 * Canned analysis for local UI work — no Claude call, no API key, no cost.
 * Enabled by MOCK_ANALYSIS=1 (dev only; see src/app/api/analyze/route.ts).
 *
 * Deliberately opinionated content: uneven scores, a real mismatch and a mix of
 * gap sizes, so the result page is exercised the way a genuine report would
 * exercise it.
 */
export function buildMockAnalysis(p1: string, p2: string): Analysis {
  return {
    teaser: {
      overallScore: 72,
      verdict: "Warm but conflict-avoidant",
      coupleLine: `You're the couple that can talk for six hours about nothing and go three days without mentioning the one thing that's actually wrong.`,
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
          headline: `${p1} raises her voice, ${p2} goes silent — and neither reads the other's move as an attempt to fix it.`,
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
      blindSpots: [
        "How you handle conflict",
        "Where you see this in 5 years",
        "Your boundaries around exes",
      ],
      flagSummary:
        "You agreed on 6 out of 8 boundaries — but the 2 you didn't are the ones that start real fights.",
    },
    full: {
      seeEachOther: {
        partner1View: `${p1} describes ${p2} as steady and funny — the person who makes her laugh mid-argument. But she circles back to him "disappearing into himself" when things get hard, and that's the part she leads with when asked what drives her crazy.`,
        partner2View: `${p2} describes ${p1} as the most loyal person he knows, and immediately follows it with "the most intense." His irritation is about the past being brought into the present — old grievances arriving in the middle of small disagreements.`,
        mismatch: `Both descriptions are affectionate, but they're describing different problems. ${p1} experiences ${p2}'s withdrawal as absence; ${p2} experiences ${p1}'s intensity as pressure. Neither has named that these are the same moment seen from two sides — his silence is a response to her escalation, and her escalation is a response to his silence.`,
      },
      conflictDNA: {
        pattern: "Pursuer-Withdrawer",
        description: `One partner moves toward conflict to resolve it and the other moves away to contain it. Both are trying to protect the relationship, and each reads the other's strategy as proof they don't care.`,
        howItPlaysOut: `${p1} raises her voice because staying quiet feels like giving up. ${p2} goes completely silent because staying in it feels like it will get worse. She reads the silence as stonewalling; he reads the volume as an attack. You both said the last real fight ran multiple days — that's the loop running its full length with nobody able to stop it.`,
        advice: `Agree on a pause word either of you can use, with a fixed return time — twenty minutes, not "later". ${p2} names when he's coming back; ${p1} holds the point until then instead of escalating to be heard.`,
      },
      gapMap: {
        scaleGaps: [
          {
            topic: "Independence vs Togetherness",
            partner1Position: "Wants substantial independence",
            partner2Position: "Wants to do nearly everything together",
            gapSize: "major",
            comment:
              "This is the widest gap in your answers and it sits underneath most of your friction about time and plans.",
          },
          {
            topic: "Honesty vs Keeping the Peace",
            partner1Position: "Brutally honest",
            partner2Position: "Keeps the peace",
            gapSize: "significant",
            comment:
              "It explains the conflict pattern directly: one of you thinks saying it is the repair, the other thinks not saying it is.",
          },
          {
            topic: "Career vs Family",
            partner1Position: "Leans family first",
            partner2Position: "Leans career first",
            gapSize: "significant",
            comment:
              "Worth a real conversation before the next big decision forces one, rather than after.",
          },
          {
            topic: "Kids",
            partner1Position: "Undecided, near the middle",
            partner2Position: "Leans toward kids soon",
            gapSize: "minor",
            comment:
              "Close enough for now, but this is the gap that stops being small the moment either of you moves.",
          },
        ],
        blitzSplits: [
          {
            statement: "Being close friends with an ex",
            partner1: "fine",
            partner2: "dealbreaker",
            insight:
              "A hard split on a boundary neither of you has ever stated out loud.",
          },
          {
            statement: "Knowing each other's phone passwords",
            partner1: "dealbreaker",
            partner2: "fine",
            insight:
              "You want opposite things from privacy, and both of you read the other's preference as suspicious.",
          },
        ],
        overallInsight: `Your gaps aren't about values — you want the same life. They're about proximity: how much space is safe, and how much honesty is kind. The exes and passwords split is the one to talk about this week, because right now you're each assuming the other agrees.`,
      },
      afraidToLose: {
        partner1: `${p1} would miss being made to laugh when she's furious — the specific thing nobody else does. What she values is being disarmed, not being agreed with.`,
        partner2: `${p2} would miss being noticed before he says anything. What he values is being read accurately without having to explain himself.`,
        alignment: `You're afraid of losing two different things, and both are about attention. She wants his lightness; he wants her attentiveness. The good news is you already give each other these — the risk is that both are the first things to disappear during a bad stretch.`,
      },
      uncomfortableTruth: {
        headline: `${p2} has thought about leaving more than once, and ${p1} does not know that.`,
        explanation: `She answered that she considered it once during a rough patch; he answered more than once. She's certain about five years from now; he said "hopefully, but who knows." That asymmetry is the real risk — not because he's leaving, but because she's building on an assumption of certainty he hasn't shared. Every unfinished argument costs him more than it costs her, and she has no way to know that from the outside.`,
      },
      gettingRight: [
        {
          title: "You still like each other",
          detail: `Both of your descriptions of the other start with something genuinely admiring — steady and funny, the most loyal person I know. After six years, that's not nothing, and it's the thing that makes the rest fixable.`,
        },
        {
          title: "Nobody is keeping score in public",
          detail: `Neither of you flagged venting about the relationship to friends as a habit you rely on. You keep your conflict inside the relationship, which means it stays solvable between you.`,
        },
        {
          title: "You repair, even if slowly",
          detail: `You do come back from fights. Multiple days is too long, but you're describing a couple that returns to each other rather than one that lets things quietly rot.`,
        },
      ],
      actionPlan: [
        {
          title: "Agree on a pause word tonight",
          detail:
            "Pick one word either of you can say mid-argument. Whoever says it names a return time under 30 minutes. The rule is that the conversation restarts — pausing isn't ending it.",
        },
        {
          title: "Sunday 20-minute check-in",
          detail:
            "Same time each week, phones in the other room. One question: what's the thing you haven't said this week? Hard stop at 20 minutes.",
        },
        {
          title: "Say the exes rule out loud",
          detail:
            "You split hard on this and have never stated it. Take ten minutes and each say what you'd actually be uncomfortable with, specifically.",
        },
        {
          title: "Ban 2021 from arguments about dishes",
          detail: `${p1} names one old grievance she'll stop bringing into small disagreements. ${p2} names one thing he'll say out loud instead of going quiet.`,
        },
        {
          title: "Book the five-year conversation",
          detail:
            "Not tonight and not during a fight — pick a date in the next two weeks and put it in the calendar so it can't drift.",
        },
      ],
      conversationStarters: [
        "When you go quiet, what are you actually protecting?",
        "What did you mean by 'hopefully together, but who knows'?",
        "Where's your real line with an ex — not the polite answer?",
        "What would I have to stop doing for the next fight to end in an hour?",
      ],
    },
  };
}
