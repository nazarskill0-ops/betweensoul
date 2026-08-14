import { HAIKU, SONNET, generateJson } from "@/lib/claude";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockPaidSections } from "@/lib/mockAnalysis";
import {
  validateAnswer,
  validateConflictLove,
  validateFuture,
  validateMirrorScenario,
  validateUnsaidGaps,
} from "@/lib/parseAnalysis";
import {
  baseSystemPrompt,
  paidAnswerPrompt,
  paidConflictLovePrompt,
  paidFuturePrompt,
  paidMirrorScenarioPrompt,
  paidUnsaidGapsPrompt,
} from "@/lib/prompts";
import {
  claimPaidGeneration,
  getReport,
  releasePaidGeneration,
  savePaidSections,
} from "@/lib/reportStore";
import { FreeSections, PaidSections, TranscriptData } from "@/lib/types";
import { logPassCost } from "@/lib/usage";

/**
 * The paid report — nine sections from five parallel Sonnet requests, run once
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
 * A truncated response is a failed section for someone who has already paid,
 * so each request gets more room than its measured ceiling rather than less.
 * (A response that truncates anyway is retried at double — see claude.ts.)
 */
const MAX_TOKENS = 3000;
/** Five scenarios of 3-4 sentences, plus the two facing bullet lists. */
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

  const [unsaidGaps, conflictLove, mirrorScenario, future, answer] =
    await Promise.all([
      request("unsaid", paidUnsaidGapsPrompt(input, free), validateUnsaidGaps),
      request(
        "conflict",
        paidConflictLovePrompt(input, free),
        validateConflictLove,
      ),
      request(
        "scenarios",
        paidMirrorScenarioPrompt(input, free),
        validateMirrorScenario,
        SCENARIO_MAX_TOKENS,
      ),
      request("future", paidFuturePrompt(input, free), validateFuture),
      request("answer", paidAnswerPrompt(input, free), validateAnswer),
    ]);

  console.log(`[paid] all five requests done in ${Date.now() - startedAt}ms`);
  await logPassCost(reportId, "paid");

  return {
    ...unsaidGaps,
    ...conflictLove,
    ...mirrorScenario,
    ...future,
    ...answer,
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
