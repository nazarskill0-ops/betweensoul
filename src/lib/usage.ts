import { redis } from "@/lib/redis";

/**
 * What each report cost to generate.
 *
 * Every call to Anthropic is recorded — including the ones that failed
 * validation or came back truncated, because those are billed too and they are
 * exactly the ones worth noticing. A report whose X-ray truncated three times
 * costs four calls for one section, and the only place that shows up is here.
 */

/** USD per million tokens. Keep in step with the models used in claude.ts. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
};

export interface UsageEntry {
  model: string;
  /** The request label, e.g. "free/radar" or "paid/xray". */
  section: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  timestamp: string;
  /** True when this call ran on the fallback model after the primary failed. */
  is_fallback: boolean;
}

const key = (reportId: string) => `usage:${reportId}`;

/** Kept as long as the report it belongs to. */
const TTL_SECONDS = 60 * 60 * 24;

export function costOf(model: string, inputTokens: number, outputTokens: number) {
  const price = PRICING[model];
  if (!price) {
    console.warn("[usage] no pricing for %s — recording it at zero.", model);
    return 0;
  }
  return (
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output
  );
}

/**
 * Appends one call to the report's usage log.
 *
 * A Redis list rather than a JSON array under one key: the five requests of a
 * pass run concurrently, and read-modify-write on a single value would lose
 * whichever entries lost the race. RPUSH is atomic, and reading the key back
 * with LRANGE still yields the array of objects.
 *
 * Never throws. Losing a cost record must not fail a report someone is waiting
 * for — or, worse, one they have paid for.
 */
export async function recordUsage(
  reportId: string,
  entry: UsageEntry,
): Promise<void> {
  try {
    const db = redis();
    const length = await db.rpush(key(reportId), JSON.stringify(entry));
    if (length === 1) await db.expire(key(reportId), TTL_SECONDS);
  } catch (error) {
    console.error("[usage] could not record %s for %s:", entry.section, reportId, error);
  }
}

export async function getUsage(reportId: string): Promise<UsageEntry[]> {
  try {
    const raw = await redis().lrange<UsageEntry | string>(key(reportId), 0, -1);
    // The client parses JSON strings on the way out; older entries may not be.
    return raw.map((item) =>
      typeof item === "string" ? (JSON.parse(item) as UsageEntry) : item,
    );
  } catch (error) {
    console.error("[usage] could not read the log for %s:", reportId, error);
    return [];
  }
}

function modelLabel(model: string) {
  if (model.includes("haiku")) return "Haiku";
  if (model.includes("sonnet")) return "Sonnet";
  return model;
}

/**
 * Logs what one pass cost, e.g.
 *
 *   [CoupleScan] Report abc — free cost: $0.0034 (Haiku, 5 calls)
 *
 * The pass is read off the section prefix, so a report that has been unlocked
 * reports its free and paid halves separately rather than as one number.
 */
export async function logPassCost(
  reportId: string,
  pass: "free" | "paid",
): Promise<void> {
  const entries = (await getUsage(reportId)).filter((entry) =>
    entry.section.startsWith(`${pass}/`),
  );
  if (!entries.length) return;

  const total = entries.reduce((sum, entry) => sum + entry.cost_usd, 0);
  const fallbacks = entries.filter((entry) => entry.is_fallback);
  // The label names the model the pass was meant to run on; any call that
  // dropped to the fallback is called out after the count rather than hidden
  // inside an averaged-out total.
  const primary = modelLabel(
    (entries.find((entry) => !entry.is_fallback) ?? entries[0]).model,
  );

  const fallbackNote = fallbacks.length
    ? `, ${fallbacks.length} via ${modelLabel(fallbacks[0].model)} fallback`
    : "";

  console.log(
    `[CoupleScan] Report ${reportId} — ${pass} cost: $${total.toFixed(4)} ` +
      `(${primary}, ${entries.length} call${entries.length === 1 ? "" : "s"}${fallbackNote})`,
  );
}
