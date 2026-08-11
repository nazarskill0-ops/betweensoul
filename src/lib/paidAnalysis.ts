import { HAIKU, SONNET, generateJson } from "@/lib/claude";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockPaidSections } from "@/lib/mockAnalysis";
import {
  validateConflictFuture,
  validateGapsView,
  validateLoveAnchors,
  validateScenarioResetAnswer,
  validateXRay,
} from "@/lib/parseAnalysis";
import {
  baseSystemPrompt,
  paidConflictFuturePrompt,
  paidGapsViewPrompt,
  paidLoveAnchorsPrompt,
  paidScenarioResetAnswerPrompt,
  paidXRayPrompt,
} from "@/lib/prompts";
import {
  claimPaidGeneration,
  getReport,
  releasePaidGeneration,
  savePaidSections,
} from "@/lib/reportStore";
import {
  DimensionId,
  FreeSections,
  PaidSections,
  TranscriptData,
} from "@/lib/types";
import { logPassCost } from "@/lib/usage";

/**
 * The paid report — ten sections from five parallel Sonnet requests, run once
 * the transaction is confirmed.
 *
 * Sonnet rather than Haiku because this is the part that has to reason instead
 * of pattern-match: two partners describing each other in different registers
 * is a difference in how they express affection, not evidence of a problem,
 * and Haiku reads that kind of contrast as pathology. Haiku is still the
 * fallback — for someone who has already paid, a shallower section beats an
 * error page.
 *
 * The free sections go into the prompts as context so the deep dive can't
 * contradict scores and teasers the reader has already seen.
 */

/**
 * Token budgets, measured rather than guessed.
 *
 * Four of the five requests land between 950 and 2000 output tokens. The X-ray
 * is a different size of job — eight dimensions times four paragraphs each —
 * and truncated at 3000 on every attempt, taking the whole unlock down with it
 * after someone had already paid. It gets the room the section actually needs.
 */
const MAX_TOKENS = 3000;
const XRAY_MAX_TOKENS = 8000;
/** Five scenarios plus the reset plus the finale; measured at 2006. */
const SCENARIO_MAX_TOKENS = 4000;

export async function generatePaidSections(
  input: TranscriptData,
  free: FreeSections,
  reportId: string,
): Promise<PaidSections> {
  const system = baseSystemPrompt(
    input.partner1.name || "Partner 1",
    input.partner2.name || "Partner 2",
  );
  const startedAt = Date.now();

  // The X-ray reuses the radar's scores rather than scoring again, so the two
  // halves of the report can't disagree about the same dimension.
  const radarScores = Object.fromEntries(
    free.radar.dimensions.map((d) => [d.id, d.score]),
  ) as Record<DimensionId, number>;

  const request = <T>(
    label: string,
    prompt: string,
    validate: (text: string) => T,
    maxTokens = MAX_TOKENS,
  ) =>
    generateJson({
      label: `paid/${label}`,
      reportId,
      model: SONNET,
      fallbackModel: HAIKU,
      system,
      prompt,
      maxTokens,
      validate,
    });

  const [fullXRay, gapsView, conflictFuture, loveAnchors, scenarioResetAnswer] =
    await Promise.all([
      request(
        "xray",
        paidXRayPrompt(input, free),
        (text) => validateXRay(text, radarScores),
        XRAY_MAX_TOKENS,
      ),
      request("gaps", paidGapsViewPrompt(input, free), validateGapsView),
      request(
        "conflict",
        paidConflictFuturePrompt(input, free),
        validateConflictFuture,
      ),
      request("love", paidLoveAnchorsPrompt(input, free), validateLoveAnchors),
      request(
        "scenarios",
        paidScenarioResetAnswerPrompt(input, free),
        validateScenarioResetAnswer,
        SCENARIO_MAX_TOKENS,
      ),
    ]);

  console.log(`[paid] all five requests done in ${Date.now() - startedAt}ms`);
  await logPassCost(reportId, "paid");

  return {
    fullXRay,
    ...gapsView,
    ...conflictFuture,
    ...loveAnchors,
    ...scenarioResetAnswer,
  };
}

/**
 * Claim → generate → store, shared by the unlock route and the webhook.
 *
 * The claim is atomic (see reportStore.claimPaidGeneration), so a webhook
 * landing while the buyer's own unlock call is still running is a no-op rather
 * than a second Sonnet bill. A failed run is released so the next call retries
 * instead of leaving the buyer on a permanent spinner.
 *
 * Returns the sections when this call did the work, and null when it didn't —
 * either because someone else holds the claim or because the run failed.
 */
export async function runPaidGeneration(
  reportId: string,
): Promise<PaidSections | null> {
  if (!(await claimPaidGeneration(reportId))) return null;

  try {
    const report = await getReport(reportId);
    if (!report) throw new Error(`report ${reportId} vanished mid-generation`);
    if (!report.paid) throw new Error(`report ${reportId} is not paid for`);

    // Fixture mode: the canned deep dive, so the paid half can be reviewed
    // with no Sonnet call and no Paddle checkout. Dev-only — see devMode.ts.
    const sections = MOCK_MODE
      ? buildMockPaidSections(report.partner1Name, report.partner2Name)
      : await generatePaidSections(report.answers, report.free, reportId);

    await savePaidSections(reportId, sections);
    console.log("[paid] report %s is ready.", reportId);
    return sections;
  } catch (error) {
    console.error("[paid] generation failed for %s:", reportId, error);
    await releasePaidGeneration(reportId);
    return null;
  }
}
