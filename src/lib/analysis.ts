import Anthropic from "@anthropic-ai/sdk";
import { validateFreeReport } from "@/lib/parseAnalysis";
import { freePrompt } from "@/lib/prompts";
import { FreeReport, TranscriptData } from "@/lib/types";

/**
 * The free overview — one Haiku request, fired the moment the test is
 * submitted.
 *
 * This used to be four or five parallel requests covering the whole report.
 * Each one saw the full transcript and latched onto the same few vivid
 * answers, so the same quote turned up in several sections. Free is now a
 * single request (nothing to repeat itself against) and the paid deep dive
 * moved to its own pass after payment — see paidAnalysis.ts.
 *
 * Haiku 4.5 supports neither `output_config.format` (structured outputs) nor
 * `effort`, so the JSON contract is enforced by the prompt and validated in
 * parseAnalysis.ts instead.
 */
const MODEL = "claude-haiku-4-5";

/** The free overview is short; this is comfortable headroom. */
const MAX_TOKENS = 2000;

export async function generateFreeReport(
  input: TranscriptData,
): Promise<FreeReport> {
  const client = new Anthropic();
  const prompt = freePrompt(input);
  let lastError: unknown;

  // Retried once: a malformed response is usually a one-off, and the reader is
  // waiting on this one.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      });

      if (message.stop_reason === "refusal") {
        // Retrying an identical prompt will be refused again.
        throw new Error("The free report was declined by the safety system.");
      }
      if (message.stop_reason === "max_tokens") {
        throw new Error(
          `The free report was cut off at the ${MAX_TOKENS}-token limit.`,
        );
      }

      const text = message.content.find((block) => block.type === "text");
      if (!text || text.type !== "text") {
        throw new Error("The free report came back with no text content.");
      }

      const report = validateFreeReport(text.text);
      console.log(
        `[free] ${Date.now() - startedAt}ms, ${message.usage.output_tokens} output tokens`,
      );
      return report;
    } catch (error) {
      if (error instanceof Error && error.message.includes("declined by the safety system")) {
        throw error;
      }
      lastError = error;
      console.warn(`[free] attempt ${attempt} failed:`, error);
    }
  }

  throw new Error(
    `The free report failed twice: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}
