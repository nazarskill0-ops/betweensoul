import { HAIKU, generateJson } from "@/lib/claude";
import {
  validateRadar,
  validateScenarios,
  validateScoreDynamic,
  validateSlidersGaps,
  validateUnsaidFlags,
} from "@/lib/parseAnalysis";
import {
  baseSystemPrompt,
  freeRadarPrompt,
  freeScenariosPrompt,
  freeScoreDynamicPrompt,
  freeSlidersGapsPrompt,
  freeUnsaidFlagsPrompt,
} from "@/lib/prompts";
import { FreeSections, TranscriptData } from "@/lib/types";
import { logPassCost } from "@/lib/usage";

/**
 * The free report — nine sections from five Haiku requests, fired the moment
 * the test is submitted.
 *
 * Five rather than one because the sections do not fit in a single 2000 token
 * response, and rather than nine because sections that must agree with each
 * other have to be written together: the radar and the strength/tension drawn
 * from it, the sliders and the perception gap that read off the same
 * comparisons.
 *
 * The score goes first and the other four run concurrently behind it. That
 * costs one request's latency — about a second on Haiku for a section this
 * short — and buys the overall score for the other four prompts. Two of the
 * calibration rules are written in terms of that number, and a section that
 * couldn't see it was guessing at the tone: a couple who scored 52 was being
 * told, by the radar, that their biggest gap was staggering.
 *
 * Any one failing fails the whole report — a report missing its score or its
 * dynamic is not worth showing.
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
  reportId: string,
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
      reportId,
      model: HAIKU,
      system,
      prompt,
      maxTokens,
      validate,
    });

  const scoreDynamic = await request(
    "score",
    freeScoreDynamicPrompt(input),
    validateScoreDynamic,
  );
  const { overall } = scoreDynamic.coupleScore;
  console.log(
    `[free] scored ${overall}/100 in ${Date.now() - startedAt}ms; four more requests to go`,
  );

  const [radar, slidersGaps, unsaidFlags, scenarios] = await Promise.all([
    request(
      "radar",
      freeRadarPrompt(input, overall),
      validateRadar,
      RADAR_MAX_TOKENS,
    ),
    request("sliders", freeSlidersGapsPrompt(input, overall), validateSlidersGaps),
    request("unsaid", freeUnsaidFlagsPrompt(input, overall), validateUnsaidFlags),
    request("scenarios", freeScenariosPrompt(input, overall), validateScenarios),
  ]);

  console.log(`[free] all five requests done in ${Date.now() - startedAt}ms`);
  await logPassCost(reportId, "free");

  return {
    ...scoreDynamic,
    ...radar,
    ...slidersGaps,
    ...unsaidFlags,
    ...scenarios,
  };
}
