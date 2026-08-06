import Anthropic from "@anthropic-ai/sdk";
import {
  ActionItemsPart,
  ConflictPerceptionPart,
  EmotionalCorePart,
  GapAnalysisPart,
  OverviewPart,
  validateActionItems,
  validateAnalysis,
  validateConflictPerception,
  validateEmotionalCore,
  validateGapAnalysis,
  validateOverview,
} from "@/lib/parseAnalysis";
import {
  AnalysisInput,
  actionItemsPrompt,
  buildUserPrompt,
  conflictPerceptionPrompt,
  emotionalCorePrompt,
  gapAnalysisPrompt,
  overviewPrompt,
} from "@/lib/prompts";
import {
  Analysis,
  CATEGORY_IDS,
  CATEGORY_LABELS,
  CategoryId,
} from "@/lib/types";

/**
 * The report is generated as five parallel requests rather than one.
 *
 * One request for the whole report took ~86s on Sonnet and produced a single
 * large JSON blob that occasionally broke (unescaped control characters inside
 * the long analysis strings). Smaller requests run concurrently, so the wall
 * clock is the slowest part rather than the sum, each response is small enough
 * to stay well-formed, and a bad one can be retried on its own.
 *
 * Latency tracks output length, so each part is scoped to keep its response
 * short — the whole report waits on whichever request writes the most.
 *
 * Haiku 4.5 is a Claude 4.5 model: it supports neither `output_config.format`
 * (structured outputs) nor `effort`, so the JSON contract is enforced by the
 * prompt and validated in parseAnalysis.ts instead.
 */
const MODEL = "claude-haiku-4-5-20251001";



/** Kept deliberately tight — each part is a fraction of the whole report, and
 *  a smaller ceiling keeps the slowest request short. */
const MAX_TOKENS = 2000;

type PartName =
  | "overview"
  | "conflict & perception"
  | "gap analysis"
  | "emotional core"
  | "action items";

/**
 * One request, parsed and validated. Retries once — a malformed response is
 * usually a one-off, and re-running a single part costs a few seconds rather
 * than restarting the whole report.
 */
async function callClaude<T>(
  client: Anthropic,
  part: PartName,
  systemPrompt: string,
  userPrompt: string,
  validate: (raw: string) => T,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      if (message.stop_reason === "refusal") {
        // Retrying an identical prompt will be refused again.
        throw new Error(`The ${part} section was declined by the safety system.`);
      }
      if (message.stop_reason === "max_tokens") {
        throw new Error(
          `The ${part} section was cut off at the ${MAX_TOKENS}-token limit.`,
        );
      }

      const text = message.content.find((block) => block.type === "text");
      if (!text || text.type !== "text") {
        throw new Error(`The ${part} section came back with no text content.`);
      }

      const result = validate(text.text);
      console.log(
        `[analysis] ${part}: ${Date.now() - startedAt}ms, ${
          message.usage.output_tokens
        } output tokens`,
      );
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes("declined by the safety system")) {
        throw error;
      }
      lastError = error;
      console.warn(`[analysis] ${part} attempt ${attempt} failed:`, error);
    }
  }

  throw new Error(
    `The ${part} section failed twice: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}

/** Loose match so "Trust & Boundaries" or "trust_safety" still lands on "trust". */
function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z]/g, "");
}

const ID_ALIASES: Record<string, CategoryId> = {
  trustboundaries: "trust",
  trustsafety: "trust",
  boundaries: "trust",
  conflictresolution: "conflict",
  conflictrepair: "conflict",
  emotionalintimacy: "intimacy",
  sharedvaluesgoals: "values",
  sharedvalues: "values",
  sharedfuture: "values",
  futuregoals: "values",
  future: "values",
};

/**
 * Lines a model-returned category list up with CATEGORY_IDS.
 *
 * Matches on id first; anything left over is filled by position, so a run
 * where Haiku renamed a category still merges instead of dropping content.
 */
function alignToCategories<T extends { id: string }>(items: T[]): (T | undefined)[] {
  const aligned: (T | undefined)[] = CATEGORY_IDS.map(() => undefined);
  const unmatched: T[] = [];

  for (const item of items) {
    const key = normalizeId(item.id);
    const canonical = (CATEGORY_IDS as readonly string[]).includes(key)
      ? (key as CategoryId)
      : ID_ALIASES[key];
    const index = canonical ? CATEGORY_IDS.indexOf(canonical) : -1;

    if (index !== -1 && !aligned[index]) {
      aligned[index] = item;
    } else {
      unmatched.push(item);
    }
  }

  for (let i = 0; i < aligned.length && unmatched.length; i++) {
    if (!aligned[i]) aligned[i] = unmatched.shift();
  }

  return aligned;
}

/** Stitches the five responses back into the single Analysis the UI expects. */
function mergeAnalysis(
  overview: OverviewPart,
  perception: ConflictPerceptionPart,
  gaps: GapAnalysisPart,
  core: EmotionalCorePart,
  actions: ActionItemsPart,
): Analysis {
  const aligned = alignToCategories(overview.categories);

  return {
    teaser: {
      overallScore: overview.overallScore,
      verdict: overview.verdict,
      coupleLine: overview.coupleLine,
      // The label comes from CATEGORY_LABELS rather than the model, so the UI
      // never shows a category renamed mid-run.
      categories: CATEGORY_IDS.map((id, i) => ({
        id,
        name: CATEGORY_LABELS[id],
        score: aligned[i]?.score ?? overview.overallScore,
        headline: aligned[i]?.headline ?? "",
      })),
      blindSpots: overview.blindSpots,
      flagSummary: overview.flagSummary,
    },
    full: {
      seeEachOther: perception.seeEachOther,
      conflictDNA: perception.conflictDNA,
      gapMap: gaps,
      afraidToLose: core.afraidToLose,
      uncomfortableTruth: core.uncomfortableTruth,
      gettingRight: core.gettingRight,
      actionPlan: actions.actionPlan,
      conversationStarters: actions.conversationStarters,
    },
  };
}

export async function generateAnalysis(input: AnalysisInput): Promise<Analysis> {
  const p1 = input.partner1.name || "Partner 1";
  const p2 = input.partner2.name || "Partner 2";

  const userPrompt = buildUserPrompt(input);
  const client = new Anthropic();

  const [overview, perception, gaps, core, actions] = await Promise.all([
    callClaude(client, "overview", overviewPrompt(p1, p2), userPrompt, validateOverview),
    callClaude(
      client,
      "conflict & perception",
      conflictPerceptionPrompt(p1, p2),
      userPrompt,
      validateConflictPerception,
    ),
    callClaude(
      client,
      "gap analysis",
      gapAnalysisPrompt(p1, p2),
      userPrompt,
      validateGapAnalysis,
    ),
    callClaude(
      client,
      "emotional core",
      emotionalCorePrompt(p1, p2),
      userPrompt,
      validateEmotionalCore,
    ),
    callClaude(
      client,
      "action items",
      actionItemsPrompt(p1, p2),
      userPrompt,
      validateActionItems,
    ),
  ]);

  // The merged object goes through whole-report validation, so a merge bug
  // can't put a half-built report in front of a paying reader.
  return validateAnalysis(
    mergeAnalysis(overview, perception, gaps, core, actions),
  );
}
