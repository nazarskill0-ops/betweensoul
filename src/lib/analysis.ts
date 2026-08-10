import { HAIKU, generateJson } from "@/lib/claude";
import {
  validateRadar,
  validateScenariosQuestion,
  validateScoreDynamic,
  validateSlidersGaps,
  validateUnsaidFlags,
} from "@/lib/parseAnalysis";
import {
  baseSystemPrompt,
  freeRadarPrompt,
  freeScenariosQuestionPrompt,
  freeScoreDynamicPrompt,
  freeSlidersGapsPrompt,
  freeUnsaidFlagsPrompt,
} from "@/lib/prompts";
import { FreeSections, TranscriptData } from "@/lib/types";

/**
 * The free report — eleven sections from five parallel Haiku requests, fired
 * the moment the test is submitted.
 *
 * Five rather than one because eleven sections do not fit in a single 2000
 * token response, and rather than eleven because sections that must agree with
 * each other have to be written together: the radar and the strength/tension
 * drawn from it, the sliders and the perception gap that read off the same
 * comparisons.
 *
 * They run concurrently, so the reader waits for the slowest one rather than
 * the sum. Any one failing fails the whole report — a report missing its score
 * or its dynamic is not worth showing.
 */

/**
 * Token budgets, measured rather than guessed: most of these requests land
 * between 400 and 600 output tokens, but the radar writes eight scored
 * dimensions plus the strength and tension drawn from them and has been seen at
 * 1847. A truncated response is a failed report, so the radar gets its own
 * ceiling. (A response that truncates anyway is retried at double — see
 * claude.ts.)
 */
const MAX_TOKENS = 2000;
const RADAR_MAX_TOKENS = 3000;

export async function generateFreeReport(
  input: TranscriptData,
): Promise<FreeSections> {
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
      label: `free/${label}`,
      model: HAIKU,
      system,
      prompt,
      maxTokens,
      validate,
    });

  const [scoreDynamic, radar, slidersGaps, unsaidFlags, scenariosQuestion] =
    await Promise.all([
      request("score", freeScoreDynamicPrompt(input), validateScoreDynamic),
      request("radar", freeRadarPrompt(input), validateRadar, RADAR_MAX_TOKENS),
      request("sliders", freeSlidersGapsPrompt(input), validateSlidersGaps),
      request("unsaid", freeUnsaidFlagsPrompt(input), validateUnsaidFlags),
      request("scenarios", freeScenariosQuestionPrompt(input), validateScenariosQuestion),
    ]);

  console.log(`[free] all five requests done in ${Date.now() - startedAt}ms`);

  return {
    ...scoreDynamic,
    ...radar,
    ...slidersGaps,
    ...unsaidFlags,
    ...scenariosQuestion,
  };
}
