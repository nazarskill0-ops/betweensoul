import Anthropic from "@anthropic-ai/sdk";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockPaidReport } from "@/lib/mockAnalysis";
import { validatePaidReport } from "@/lib/parseAnalysis";
import { paidPrompt } from "@/lib/prompts";
import {
  claimForPaidGeneration,
  getReport,
  releasePaidGeneration,
  savePaidReport,
} from "@/lib/reportStore";
import { FreeReport, PaidReport, TranscriptData } from "@/lib/types";

/**
 * The paid deep dive — one Sonnet request, fired after the order is confirmed
 * paid (or by the dev bypass).
 *
 * Sonnet rather than Haiku because this is the part that has to reason instead
 * of pattern-match: two partners describing each other in different registers
 * is a difference in how they express affection, not evidence of a problem,
 * and Haiku reads that kind of contrast as pathology. One request rather than
 * several because every section is then written with the whole picture in
 * view — which is what stops the same vivid answer being quoted four times.
 *
 * The free sections go into the prompt as context so the deep dive can't
 * contradict scores the reader has already seen.
 */
const MODEL = "claude-sonnet-4-6";

/**
 * Seven sections plus adaptive thinking, which shares this budget — at 8000 the
 * thinking ate most of it and the JSON came back truncated. 16K is the ceiling
 * a non-streaming request can carry without risking an SDK HTTP timeout.
 */
const MAX_TOKENS = 16000;

export async function generatePaidReport(
  input: TranscriptData,
  free: FreeReport,
): Promise<PaidReport> {
  const client = new Anthropic();
  const prompt = paidPrompt(input, free);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Measured on this prompt: effort `low` spends ~2,970 output tokens in
        // ~70s, `medium` ~5,400 in ~115s. The extra is nearly all thinking, and
        // it isn't worth 45 seconds of a buyer staring at a spinner — raise it
        // if the analysis ever reads shallow.
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        messages: [{ role: "user", content: prompt }],
      });

      if (message.stop_reason === "refusal") {
        throw new Error("The deep analysis was declined by the safety system.");
      }
      if (message.stop_reason === "max_tokens") {
        throw new Error(
          `The deep analysis was cut off at the ${MAX_TOKENS}-token limit.`,
        );
      }

      // Thinking blocks come first when adaptive thinking runs; the JSON is in
      // the text block.
      const text = message.content.find((block) => block.type === "text");
      if (!text || text.type !== "text") {
        throw new Error("The deep analysis came back with no text content.");
      }

      const report = validatePaidReport(text.text);
      console.log(
        `[paid] ${Date.now() - startedAt}ms, ${message.usage.output_tokens} output tokens`,
      );
      return report;
    } catch (error) {
      if (error instanceof Error && error.message.includes("declined by the safety system")) {
        throw error;
      }
      lastError = error;
      console.warn(`[paid] attempt ${attempt} failed:`, error);
    }
  }

  throw new Error(
    `The deep analysis failed twice: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}

/**
 * Claim → generate → store, shared by the webhook and the dev bypass.
 *
 * The claim is atomic (see reportStore.claimForPaidGeneration), so a webhook
 * retry landing while the first run is still going is a no-op rather than a
 * second Sonnet bill. A failed run is released back to `unpaid` so the next
 * poll retries instead of leaving the buyer on a permanent spinner.
 *
 * Returns true when this call did the work.
 */
export async function runPaidGeneration(reportId: string): Promise<boolean> {
  if (!(await claimForPaidGeneration(reportId))) return false;

  try {
    const report = await getReport(reportId);
    if (!report) throw new Error(`report ${reportId} vanished mid-generation`);

    // Fixture mode: the canned deep dive, so the paid half of the result page
    // can be reviewed with no Sonnet call and no Paddle checkout. Pair it with
    // DEV_PAID_BYPASS=1 to unlock on the first poll. Dev-only — see devMode.ts.
    const paid = MOCK_MODE
      ? buildMockPaidReport(report.partner1Name, report.partner2Name)
      : await generatePaidReport(report.answers, report.free);
    await savePaidReport(reportId, paid);
    console.log("[paid] report %s is ready.", reportId);
    return true;
  } catch (error) {
    console.error("[paid] generation failed for %s:", reportId, error);
    await releasePaidGeneration(reportId);
    return false;
  }
}
