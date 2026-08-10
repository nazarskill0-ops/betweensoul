import Anthropic from "@anthropic-ai/sdk";

/**
 * One Claude request that must come back as valid JSON.
 *
 * Both passes are five parallel requests, so this is where the shared
 * behaviour lives: the retry, the stop-reason checks, the timing log, and —
 * for the paid pass — the drop to a cheaper model when the first one keeps
 * failing.
 *
 * Neither model here supports `output_config.format`, so the JSON contract is
 * enforced by the prompt and checked by the validator rather than by the API.
 */

/** Free pass: fast and cheap enough to run five at once on submit. */
export const HAIKU = "claude-haiku-4-5-20251001";

/** Paid pass: the reasoning is the product once someone has paid for it. */
export const SONNET = "claude-sonnet-4-6";

interface RequestOptions<T> {
  /** Appears in logs, e.g. "free/radar". */
  label: string;
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  validate: (text: string) => T;
  /**
   * Tried once if `model` fails every attempt. A degraded section beats a
   * failed unlock for someone who has already paid.
   */
  fallbackModel?: string;
}

/** Refusals are deterministic — a second identical request gets refused too. */
class RefusedError extends Error {}

/** The budget was too small for what the section needed. */
class TruncatedError extends Error {}

async function attempt<T>(
  client: Anthropic,
  model: string,
  maxTokens: number,
  options: RequestOptions<T>,
): Promise<T> {
  const startedAt = Date.now();

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: options.system,
    messages: [{ role: "user", content: options.prompt }],
  });

  if (message.stop_reason === "refusal") {
    throw new RefusedError(`${options.label} was declined by the safety system`);
  }
  if (message.stop_reason === "max_tokens") {
    throw new TruncatedError(
      `${options.label} was cut off at the ${maxTokens}-token limit`,
    );
  }

  const text = message.content.find((block) => block.type === "text");
  if (!text || text.type !== "text") {
    throw new Error(`${options.label} came back with no text content`);
  }

  const result = options.validate(text.text);
  console.log(
    `[${options.label}] ${model} ${Date.now() - startedAt}ms, ${
      message.usage.output_tokens
    }/${maxTokens} output tokens`,
  );
  return result;
}

export async function generateJson<T>(options: RequestOptions<T>): Promise<T> {
  const client = new Anthropic();
  const models = options.fallbackModel
    ? [options.model, options.model, options.fallbackModel]
    : [options.model, options.model];

  let lastError: unknown;
  let maxTokens = options.maxTokens;

  for (const [index, model] of models.entries()) {
    try {
      if (model !== options.model) {
        console.warn(
          "[%s] falling back to %s after %s failed.",
          options.label,
          model,
          options.model,
        );
      }
      return await attempt(client, model, maxTokens, options);
    } catch (error) {
      // A refusal on the primary model is not a transport hiccup; only the
      // fallback is worth trying, and only because it is a different model.
      if (error instanceof RefusedError && options.fallbackModel === undefined) {
        throw error;
      }
      // A retry at the same budget truncates in exactly the same place — the
      // section is simply longer than the allowance, so raise it and try again.
      if (error instanceof TruncatedError) {
        maxTokens *= 2;
        console.warn(
          "[%s] raising the budget to %d tokens after a truncated response.",
          options.label,
          maxTokens,
        );
      }
      lastError = error;
      console.warn(`[${options.label}] attempt ${index + 1} failed:`, error);
    }
  }

  throw new Error(
    `${options.label} failed after ${models.length} attempts: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}
