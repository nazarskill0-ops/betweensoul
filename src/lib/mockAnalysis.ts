import {
  DIMENSION_IDS,
  DIMENSION_LABELS,
  FreeSections,
  PaidSections,
  RiskLevel,
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
 * rather than by a set of identical mid-range numbers.
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

  const sliderPositions = [32, 71, 78, 45, 24];
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

const SCENARIO_ANALYSIS_MOCK: Record<
  (typeof SCENARIO_IDS)[number],
  { risk: RiskLevel; analysis: (p1: string, p2: string) => string }
> = {
  living_together: {
    risk: "moderate",
    analysis: (p1, p2) =>
      `The domestic side would go better than either of you expects: you agree about mess, money for groceries and who cooks, which is where most couples find their first real fight. What would not survive contact is solitude. ${p2} recovers alone and would have nowhere to do it, and ${p1} would read a closed door as a verdict rather than as a nap. The fix is unglamorous — one room, or one hour, that belongs to whoever needs it that evening.`,
  },
  long_distance: {
    risk: "low",
    analysis: (p1, p2) =>
      `Distance mostly punishes couples who need proximity to feel secure, and neither of you does. Your answers about privacy and loyalty line up almost exactly, so the usual corrosion — checking, guessing, keeping score of replies — has nothing to feed on. What you would notice is the loss of the ordinary evenings you both named as the best part, which no amount of calling replaces. ${p1} would want to schedule contact and ${p2} would want it to stay spontaneous, and that is the negotiation, not trust.`,
  },
  financial_stress: {
    risk: "high",
    analysis: (p1, p2) =>
      `Money is the one pressure you have never actually been tested by, and it arrives with a deadline attached — which is the specific thing your conflict style cannot absorb. ${p1} would want to decide tonight; ${p2} would want to think and come back to it, and the delay would read as avoidance rather than as caution. Within two rounds you would not be arguing about the expense but about who takes this seriously. Deciding in advance who has the final call on what size of spend would take most of the heat out of it.`,
  },
  major_life_change: {
    risk: "moderate",
    analysis: (p1, p2) =>
      `A move or a new job would be decided the way things already get decided here: ${p1} proposes with momentum, ${p2} agrees rather than argues, and neither of you notices that agreeing was not the same as wanting. That works until the change costs something, at which point the one who adapted has a grievance with nowhere to sit. You are unusually good at the practical half — logistics, timelines, money — so the risk is not chaos. It is a quiet ledger that only opens two years later.`,
  },
  having_a_child: {
    risk: "high",
    analysis: (p1, p2) =>
      `Sleep deprivation removes the one thing your pattern depends on: time. Right now a fight ends because ${p2} gets space and ${p1} waits until morning, and a newborn deletes both. The division of labour would probably be fair, judging by how you already split the invisible work, but fairness is not the thing that breaks here. It is that you would be having the same unfinished argument on four hours' sleep, several times a week, with no morning to reset it in.`,
  },
};

export function buildMockPaidSections(p1: string, p2: string): PaidSections {
  return {
    unsaidThings: [
      {
        about: "partner1",
        thing: `${p1} may need more reassurance than they let on, judging by how often "being understood" came up.`,
        whyThisMatters: `Asking for reassurance directly would feel to ${p1} like admitting the relationship isn't secure, so it comes out as questions about small things instead. ${p2} answers the small thing and the real question stays open.`,
      },
      {
        about: "partner1",
        thing: `${p1} may have started keeping count of who reaches out first after a fight.`,
        whyThisMatters:
          "A tally nobody has mentioned is the kind of thing that stays harmless for a long time and then arrives all at once, usually during an argument about something else entirely.",
      },
      {
        about: "partner2",
        thing: `${p2} may want to be pursued rather than managed, and may not have the words for the difference.`,
        whyThisMatters: `${p1} reads ${p2}'s quiet as a problem to solve and moves in with questions. What the answers suggest ${p2} actually wants is to be wanted without being asked to explain themselves first.`,
      },
    ],
    allPerceptionGaps: [
      {
        topic: "How long a fight actually lasts",
        partner1Said: `${p1} said the tension clears within hours.`,
        partner2Said: `${p2} said it carries into the next day.`,
        whyItMatters:
          "One of you exits a fight when the shouting stops; the other exits when they feel repaired. It explains why the same argument returns — it was never actually finished for one of you.",
      },
      {
        topic: "Who needs more space",
        partner1Said: `${p1} described time apart as something that happens when life gets busy.`,
        partner2Said: `${p2} described it as something they actively need.`,
        whyItMatters:
          "Space means recovery for one of you and distance for the other. Left unnamed, one of you keeps apologizing for a need and the other keeps bracing for rejection.",
      },
      {
        topic: "What counts as a plan",
        partner1Said: `${p1} treats a mentioned idea as something you have agreed to do.`,
        partner2Said: `${p2} treats it as something you have agreed to think about.`,
        whyItMatters:
          "Half your disappointments start here, and neither of you has done anything wrong by their own definition — which is exactly why it never gets resolved.",
      },
      {
        topic: "Being known",
        partner1Said: `${p1} believes ${p2} knows them completely.`,
        partner2Said: `${p2} described still finding out things about ${p1}.`,
        whyItMatters:
          "One of you feels finished being explained and the other is still listening. That asymmetry is quiet, and it decides who does the asking for the next few years.",
      },
    ],
    conflictFingerprint: {
      trigger: `It rarely starts with the topic. It starts when ${p1} senses distance and moves to close it, usually at the worst possible hour.`,
      reaction: `${p1} gets more direct and more urgent. ${p2} gets shorter, flatter, and eventually stops answering in full sentences.`,
      escalation: `Around the ten-minute mark the content stops mattering. From there you are arguing about whether ${p2} is even in the conversation.`,
      withdrawal: `${p2} leaves the room or the thread. ${p1} reads that as the end of the relationship rather than the end of the evening.`,
      aftermath: `${p1} reaches out first, usually the next morning, and the thing that actually started it never gets named again.`,
      repeat: `You reconcile by outlasting it rather than by closing it, so the next one starts from exactly the same place. Nobody has ever said out loud what would count as finished.`,
    },
    loveStyles: {
      partner1Shows: `${p1} shows love by paying attention out loud: noticing, asking, following up on something said in passing a week ago.`,
      partner1FeelsLovedBy: `${p1} feels loved when ${p2} volunteers something unprompted — a plan, a worry, anything that wasn't extracted.`,
      partner1Gap: `${p1} gives attention and wants disclosure, which means the harder ${p1} tries, the more it reads to ${p2} as pressure.`,
      partner2Shows: `${p2} shows love by handling things: the logistics, the errand nobody mentioned, the problem that quietly stopped being one.`,
      partner2FeelsLovedBy: `${p2} feels loved when the pressure comes off — when time together doesn't have a conversation attached to it.`,
      partner2Gap: `${p2} gives relief and wants ease, so the thing ${p2} does most carefully is the thing ${p1} is least likely to notice.`,
    },
    howYouSeeEachOther: {
      partner1SeesPartner2: [
        "Steady, and a little unreachable",
        "Present, but rarely volunteers what's underneath",
        "The calm one, which is sometimes lonely to be next to",
      ],
      partner2SeesPartner1: [
        "Warm, and relentless about it",
        "Doesn't let a thing go until it's been talked through",
        "The one who notices everything, including things better left alone",
      ],
      surprise: `Neither of you seems to notice you are doing the same thing — trying to protect this — in a language the other doesn't read as protection.`,
    },
    /**
     * Five genuinely different paragraphs, not one repeated — the fixture is
     * how the section gets reviewed, and a fixture that says the same thing
     * five times hides exactly the failure this section is most prone to.
     */
    scenarioLab: SCENARIO_IDS.map((id) => ({
      id,
      name: SCENARIO_LABELS[id],
      risk: SCENARIO_ANALYSIS_MOCK[id].risk,
      analysis: SCENARIO_ANALYSIS_MOCK[id].analysis(p1, p2),
    })),
    ifNothingChanges: {
      sixMonths: `Trust and humor hold — your answers suggest neither is conditional on things going well. The conflict pattern gets quieter rather than louder: ${p1} raises things slightly less often, and reads the drop in arguments as progress.`,
      twelveMonths: `The quiet is the problem by now. ${p1} may have stopped raising things at all, and ${p2} may still believe the last year went well, which is the specific disagreement that is hardest to discover.`,
      turningPoint: `It changes the first time a fight gets formally ended — both of you saying, out loud, that it is finished and why. That is a five-minute conversation you could have this week, and it is the only thing here that needs to happen before anything else does.`,
      strain: "moderate",
    },
    whatKeepsYouTogether: {
      mainForce: "Genuine trust, unprompted on both sides",
      alsoHolding: ["Shared humor", "A future you both describe the same way"],
      watchOutFor: `Comfort is doing more work here than either of you would admit. Some of what reads as peace is a fight neither of you wants to restart, and it would be easy to mistake one for the other for years.`,
      isItEnough: `For now, yes — and that is a real answer, not a hedge. What your answers cannot tell us is whether it survives the first thing that cannot be fixed by waiting until morning.`,
    },
    theAnswer: {
      shortAnswer: "Yes, but…",
      verdict: `This is a strong match with one unresolved mechanism. The trust is real and the way you each describe the other is affectionate in a way that would be hard to fake on a quiz. What you have not built is a way to finish an argument.`,
      biggestOpportunity: `Everything else here is already working, which means one change carries the whole report: learning to close a fight deliberately instead of outlasting it. Do that and the perception gap about how long fights last closes with it.`,
      conversationToHave: `Tonight, ask each other: "What has to happen for a fight to be over for you?" — and let ${p2} answer first, because ${p1} will fill the silence otherwise.`,
    },
  };
}
