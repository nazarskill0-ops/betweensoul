import {
  DIMENSION_IDS,
  DIMENSION_LABELS,
  FreeSections,
  PaidSections,
  SCENARIO_IDS,
  SCENARIO_LABELS,
  SLIDER_QUESTIONS,
  ScenarioStatus,
} from "@/lib/types";

/**
 * Canned reports for local UI work — no Claude call, no API key, no cost.
 * Enabled by MOCK_ANALYSIS=1 (dev only; see src/lib/devMode.ts).
 *
 * Deliberately uneven: the scores spread from 41 to 88 and the sliders lean
 * both ways, so the page is exercised the way a real report would exercise it
 * rather than by eleven identical mid-range numbers.
 */

const DIMENSION_MOCK: Record<
  (typeof DIMENSION_IDS)[number],
  { score: number; insight: (p1: string, p2: string) => string }
> = {
  emotional_connection: {
    score: 79,
    insight: (p1, p2) =>
      `${p1} and ${p2} both reached for the same kind of answer about what they'd miss — the ordinary evenings, not the highlights.`,
  },
  communication: {
    score: 68,
    insight: (p1) =>
      `You talk constantly, but ${p1}'s answers suggest the one subject that actually stings gets routed around.`,
  },
  trust: {
    score: 88,
    insight: () =>
      "Neither of you flagged a single dealbreaker around loyalty, and your answers about privacy line up almost exactly.",
  },
  chemistry: {
    score: 74,
    insight: (_p1, p2) =>
      `${p2} described wanting more romance without calling it a problem, which is usually a sign there's something to build on.`,
  },
  conflict: {
    score: 41,
    insight: (p1, p2) =>
      `${p1} moves toward the argument and ${p2} moves away from it, and neither reads the other's move as an attempt to protect the relationship.`,
  },
  shared_future: {
    score: 63,
    insight: () =>
      "You agree on the big shape of the next five years, but not on how fast to get there.",
  },
  independence: {
    score: 71,
    insight: (_p1, p2) =>
      `${p2} needs noticeably more time alone, and asks for it in a way that can read as distance.`,
  },
  playfulness: {
    score: 82,
    insight: () =>
      "Humor is your reset button — it shows up in how you both describe the good days.",
  },
};

export function buildMockFreeReport(p1: string, p2: string): FreeSections {
  const dimensions = DIMENSION_IDS.map((id) => ({
    id,
    name: DIMENSION_LABELS[id],
    score: DIMENSION_MOCK[id].score,
    insight: DIMENSION_MOCK[id].insight(p1, p2),
  }));

  const ranked = [...dimensions].sort((a, b) => b.score - a.score);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];

  const sliderPositions = [32, 71, 78, 45, 24, 63];
  const scenarioMock: Record<
    (typeof SCENARIO_IDS)[number],
    { status: ScenarioStatus; teaser: string }
  > = {
    living_together: {
      status: "watch",
      teaser: `${p2}'s need for solitude would meet ${p1}'s need for contact in one flat.`,
    },
    long_distance: {
      status: "good",
      teaser: "Your trust scores suggest you'd handle the distance better than most.",
    },
    financial_stress: {
      status: "risk",
      teaser: "Money under pressure lands straight on the argument you already avoid.",
    },
    major_life_change: {
      status: "watch",
      teaser: "The pattern where one of you decides and the other adjusts would get expensive.",
    },
    having_a_child: {
      status: "risk",
      teaser: "Sleep deprivation would hit a conflict style that needs time to cool off.",
    },
  };

  return {
    coupleScore: {
      overall: 72,
      connection: 79,
      stability: 64,
      chemistry: 74,
      insight: `You clearly like each other — that comes through in how you both answered about what you'd miss. What you haven't solved is how to disagree without ${p2} going quiet.`,
    },
    coupleDynamic: {
      name: "The Anchor & The Spark",
      description: `${p1} pushes toward resolution and novelty; ${p2} steadies things and waits. In the day to day this reads as balance, and in an argument it reads as one of you chasing and one of you retreating.`,
    },
    radar: { dimensions },
    biggestStrength: {
      dimensionId: highest.id,
      dimensionName: highest.name,
      score: highest.score,
      explanation:
        "Neither of you marked a single boundary question as a dealbreaker.",
    },
    biggestTension: {
      dimensionId: lowest.id,
      dimensionName: lowest.name,
      score: lowest.score,
      explanation: `${p1} called your last fight hours long; ${p2} called it days.`,
    },
    sliders: SLIDER_QUESTIONS.map((question, i) => ({
      question,
      partner1Position: sliderPositions[i],
    })),
    perceptionGap: {
      shown: [
        {
          topic: "How long a fight actually lasts",
          partner1Said: `${p1} described the tension clearing within a few hours.`,
          partner2Said: `${p2} described it lasting into the next day, sometimes longer.`,
          aiComment:
            "One of you is making up after a fight the other is still having. That's not a small mismatch — it's why the same argument keeps coming back.",
        },
      ],
      totalGapsFound: 4,
    },
    unsaidThings: {
      about: "partner1",
      shown: `${p1} may need more reassurance than they let on, judging by how often "being understood" came up.`,
      lockedTeaser:
        "One of you is holding something back about how the last argument actually landed.",
    },
    flags: {
      greenFlags: [
        "You laugh together easily",
        "Neither of you keeps secrets",
        "Aligned on the next five years",
        "You handle jealousy well",
      ],
      watchOuts: [
        "You tend to avoid hard conversations",
        "Arguments end without anyone naming what happened",
      ],
    },
    scenarios: SCENARIO_IDS.map((id) => ({
      id,
      name: SCENARIO_LABELS[id],
      status: scenarioMock[id].status,
      teaser: scenarioMock[id].teaser,
    })),
  };
}

export function buildMockPaidSections(p1: string, p2: string): PaidSections {
  return {
    fullXRay: DIMENSION_IDS.map((id) => ({
      dimensionId: id,
      dimensionName: DIMENSION_LABELS[id],
      score: DIMENSION_MOCK[id].score,
      whatWeSee: `On ${DIMENSION_LABELS[id].toLowerCase()}, your answers point the same way often enough that this isn't guesswork. Both of you described the same situations, just from opposite sides of them.`,
      whatAnswersSuggest: `${p1} answered this one quickly and concretely; ${p2} hedged. That difference in certainty tends to matter more than the content of either answer.`,
      whereYouDiffer: `${p1} treats this as something you solve together. ${p2} treats it as something to be managed privately and reported on afterwards.`,
      whatCouldHelp: `When ${p2} goes quiet here, try asking "are you processing or pulling away?" — it gives them an exit from silence that isn't a confrontation.`,
    })),
    allPerceptionGaps: [
      {
        topic: "How long a fight actually lasts",
        partner1Said: `${p1} said the tension clears within hours.`,
        partner2Said: `${p2} said it carries into the next day.`,
        whatThisMayMean:
          "You are not disagreeing about facts — you are describing two different experiences of the same evening. One of you exits the fight when the shouting stops; the other exits when they feel repaired.",
        whyItMatters:
          "It explains why the same argument returns: it was never actually finished for one of you.",
        conversationToHave: "When do you feel like a fight is actually over for you?",
      },
      {
        topic: "Who needs more space",
        partner1Said: `${p1} described time apart as something that happens when life gets busy.`,
        partner2Said: `${p2} described it as something they actively need.`,
        whatThisMayMean:
          "Space means recovery for one of you and distance for the other, so the same evening apart gets read two different ways.",
        whyItMatters:
          "Left unnamed, one of you will keep apologizing for a need and the other will keep bracing for rejection.",
        conversationToHave: "What does a good night apart look like to you?",
      },
    ],
    howYouSeeEachOther: {
      herViewOfHim: `${p1} sees ${p2} as steady and a little unreachable — someone who is clearly present but rarely volunteers what's underneath.`,
      hisViewOfHer: `${p2} sees ${p1} as warm and relentless, in the specific sense that ${p1} does not let a thing go until it's been talked through.`,
      whatBothMiss:
        "Neither of you seems to notice that you are each doing the same thing — trying to protect the relationship — in a language the other doesn't read as protection.",
    },
    conflictFingerprint: {
      trigger: `It rarely starts with the topic. It starts when ${p1} senses distance and moves to close it, usually at the worst possible hour.`,
      reaction: `${p1} gets more direct and more urgent. ${p2} gets shorter, flatter, and eventually stops answering in full sentences.`,
      escalation: `The content stops mattering around the ten-minute mark. From there you are arguing about whether ${p2} is even in the conversation.`,
      withdrawal: `${p2} leaves the room or the thread. ${p1} interprets that as the end of the relationship rather than the end of the evening.`,
      aftermath: `${p1} reaches out first, usually the next morning, and the specific thing that started it never gets named again.`,
      pattern:
        "Pursue, retreat, escalate, exit, patch — and because the patch never names the cause, the cycle keeps its starting conditions intact.",
      insight: `The cycle survives because it works, just barely. ${p1} gets contact back and ${p2} gets the argument to stop, so neither of you has ever had a reason to change the move that costs you both the most.`,
    },
    ifNothingChanges: {
      likelyStrengths:
        "Trust and humor look durable. Your answers suggest these are not conditional on the relationship going well, which means they'll still be there in a bad month.",
      pressurePoints: `The conflict pattern is likely to get quieter rather than louder. ${p1} may stop raising things at all, and ${p2} may read that silence as progress.`,
      whatBecomesMoreImportant:
        "Naming a fight as finished — out loud, by both of you — becomes the thing that decides how the next few years feel.",
    },
    loveStyles: {
      partner1Shows: `${p1} shows love by paying attention out loud: noticing, asking, following up on things said in passing a week ago.`,
      partner1FeelsLovedBy: `${p1} feels loved when ${p2} volunteers something unprompted — a plan, a worry, anything that wasn't extracted.`,
      partner2Shows: `${p2} shows love by handling things: the logistics, the errand nobody mentioned, the problem that quietly stopped being a problem.`,
      partner2FeelsLovedBy: `${p2} feels loved when the pressure comes off — when time together doesn't come with a conversation attached.`,
      mismatch: `${p1} is offering attention and ${p2} is offering relief, and each of you keeps giving the thing you'd most want to receive.`,
    },
    whatKeepsYouTogether: {
      anchors: ["Trust neither of you questions", "Shared humor", "A future you both describe the same way"],
      evidence: `Both of you answered the "why are you still together" question without hesitating, and neither answer was about obligation. ${p1} named the ordinary evenings; ${p2} named being known.`,
      isItEnough:
        "For now, yes — and that's a real answer, not a hedge. What your answers can't tell us is whether it survives the first thing that can't be fixed by waiting until morning.",
    },
    scenarioLab: SCENARIO_IDS.map((id, i) => ({
      id,
      name: SCENARIO_LABELS[id],
      compatibility: [58, 81, 49, 62, 44][i],
      strength: "Your trust means neither of you would be managing suspicion on top of the actual problem.",
      risk: "The conflict pattern scales badly under sustained pressure — there's less room to wait it out.",
      whatYoudStruggleWith: `${p2} would need more recovery time exactly when ${p1} would need more contact.`,
      whatWouldHelp: "Agreeing in advance on what a time-out looks like, including who restarts the conversation and when.",
    })),
    sevenDayReset: {
      day1Question: `Ask ${p2}: "When we argue, what do you wish I did differently in the first two minutes?"`,
      day2Action: `The next time ${p2} goes quiet, wait ten minutes and then say: "I'm not going anywhere. Take your time — I'm here when you're ready."`,
      day3Date: "Something with a built-in ending and no agenda — a walk somewhere neither of you has been, phones away, no relationship talk allowed.",
      whyThisWorks: `Each of these interrupts the same loop at a different point: the trigger, the retreat, and the part where you only spend unstructured time together when something is wrong.`,
    },
    theAnswer: {
      synthesis: `This is a strong relationship with one unresolved mechanism. The trust is real, the humor is real, and the way you each describe the other is affectionate in a way that can't be faked on a quiz. What you haven't built is a way to finish an argument. Right now you end fights by outlasting them, which works until something arrives that can't be outlasted.`,
      questionToDiscussTonight: "What would it take for each of us to feel like a fight is actually over?",
      conversationStarters: [
        "What's something I do during an argument that makes it harder for you?",
        "When was the last time you felt completely understood by me?",
        "What do you need from me in the hour after we fight?",
      ],
    },
    unsaidThingsUnlocked: {
      partner1: `${p1} may be quietly afraid that being the one who always reaches out first means they care more — and may have started keeping count.`,
      partner2: `${p2} may want to be pursued rather than managed, and may not know how to ask for that without it sounding like a complaint.`,
    },
  };
}
