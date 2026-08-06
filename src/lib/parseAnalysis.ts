import {
  Analysis,
  AfraidToLose,
  BLITZ_VERDICTS,
  BlitzSplit,
  ConflictDNA,
  GAP_SIZES,
  GapMap,
  SeeEachOther,
  TitledItem,
  UncomfortableTruth,
} from "@/lib/types";

/**
 * Turns Claude's raw text into validated data.
 *
 * The report is generated as five parallel requests (see analysis.ts), so this
 * module exposes a validator per part plus `validateAnalysis` for the merged
 * result. Each part is checked on its own so a bad response can be retried
 * without re-running the other four.
 *
 * We ask for bare JSON in the prompt, but a prompt is a request, not a
 * guarantee — unlike `output_config.format`, nothing at the API level enforces
 * the shape. So this both tolerates the usual deviations (markdown fences,
 * a sentence of preamble) and validates the result, rather than letting a
 * malformed report reach the result page as `undefined` everywhere.
 *
 * Throws with a specific reason; the route turns that into a 500.
 */

const CATEGORY_COUNT = 5;
const GETTING_RIGHT_COUNT = 3;

function stripToJson(raw: string): string {
  let text = raw.trim();

  // ```json … ``` or ``` … ```
  const fenced = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n?```$/);
  if (fenced) text = fenced[1].trim();

  // Any stray prose before/after the object.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first > 0 || (last !== -1 && last < text.length - 1)) {
    if (first !== -1 && last > first) text = text.slice(first, last + 1);
  }

  return text;
}

/**
 * Escapes raw control characters that appear *inside* JSON string literals.
 *
 * JSON forbids unescaped U+0000–U+001F in strings, but models routinely emit a
 * real newline inside a value. The result fails JSON.parse with "Bad control
 * character in string literal".
 *
 * The scan has to be string-aware: a blanket replace would also hit the
 * newlines *between* fields in pretty-printed JSON, turning valid whitespace
 * into a literal \n outside a string — which is itself a syntax error. So we
 * track whether we're inside a string, honouring backslash escapes so that a
 * `\"` doesn't look like the end of one.
 */
function escapeControlCharsInStrings(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (const ch of json) {
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (inString && ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }

    const code = ch.charCodeAt(0);
    if (inString && code < 0x20) {
      switch (ch) {
        case "\n":
          out += "\\n";
          break;
        case "\r":
          out += "\\r";
          break;
        case "\t":
          out += "\\t";
          break;
        case "\b":
          out += "\\b";
          break;
        case "\f":
          out += "\\f";
          break;
        default:
          out += `\\u${code.toString(16).padStart(4, "0")}`;
      }
      continue;
    }

    out += ch;
  }

  return out;
}

/**
 * Escapes double quotes that appear *inside* JSON string values.
 *
 * The model is asked to quote what the couple actually wrote, and it sometimes
 * does it literally: `"comment": "He said "fine" and left"`. That fails with
 * "Expected ',' or '}' after property value".
 *
 * In well-formed JSON a string's closing quote is always followed — after
 * optional whitespace — by one of `,}]:` or the end of the document. Any other
 * quote is an inner one, so escape it and keep scanning.
 */
function escapeStrayQuotes(json: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (inString && ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch !== '"') {
      out += ch;
      continue;
    }

    if (!inString) {
      inString = true;
      out += ch;
      continue;
    }

    let j = i + 1;
    while (j < json.length && /\s/.test(json[j])) j++;
    if (j >= json.length || ",}]:".includes(json[j])) {
      inString = false;
      out += ch;
    } else {
      out += '\\"';
    }
  }

  return out;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function fail(reason: string): never {
  throw new Error(`Malformed analysis: ${reason}`);
}

/**
 * Matches a model-supplied value against a fixed set, ignoring case and
 * surrounding whitespace — "Dealbreaker" and "dealbreaker" mean the same
 * thing, and only one of them is worth failing a whole report over.
 * Returns the canonical member, or undefined if it isn't one.
 */
function coerceEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return allowed.find((option) => option === normalized);
}

/** Checks `{ title, detail }` entries, used by gettingRight and actionPlan. */
function checkTitledItems(value: unknown, field: string, exact?: number): void {
  if (!Array.isArray(value) || value.length === 0) fail(`${field} is empty`);
  if (exact !== undefined && value.length !== exact) {
    fail(`${field} must have exactly ${exact} entries`);
  }
  for (const [i, entry] of value.entries()) {
    const item = entry as Record<string, unknown>;
    if (!isNonEmptyString(item.title)) fail(`${field}[${i}].title is empty`);
    if (!isNonEmptyString(item.detail)) fail(`${field}[${i}].detail is empty`);
  }
}

/** Raw model text -> a JSON object, with the usual deviations tolerated. */
export function parseJsonObject(raw: string): Record<string, unknown> {
  if (!isNonEmptyString(raw)) fail("model returned no text");

  const cleaned = stripToJson(raw);

  // Parse as-is first, so a well-formed response never goes through the
  // repair pass. Only if that fails do we try escaping stray control
  // characters inside string values and parse again.
  let data: unknown;
  let parsed = false;
  let firstError: unknown;

  // Each pass repairs one more class of defect. Order matters: a well-formed
  // response never goes through any of them.
  for (const repair of [
    (text: string) => text,
    escapeControlCharsInStrings,
    (text: string) => escapeStrayQuotes(escapeControlCharsInStrings(text)),
  ]) {
    try {
      data = JSON.parse(repair(cleaned));
      parsed = true;
      break;
    } catch (error) {
      firstError ??= error;
    }
  }

  if (!parsed) {
    // Report the original failure — it describes the actual defect, whereas
    // a repaired pass's error is about text we rewrote.
    fail(
      `response was not valid JSON (${
        firstError instanceof Error ? firstError.message : "unknown parse error"
      })`,
    );
  }

  if (typeof data !== "object" || data === null) fail("top level was not an object");
  return data as Record<string, unknown>;
}

/* -------------------------------------------------------------------------
 * Part validators — one per request in analysis.ts.
 *
 * Category `id` is validated as a non-empty string rather than against
 * CATEGORY_IDS: the merge step canonicalises ids (by name, then by position),
 * so a model that renames a category still produces a usable report.
 * ----------------------------------------------------------------------- */

export interface OverviewPart {
  overallScore: number;
  verdict: string;
  coupleLine: string;
  categories: { id: string; score: number; headline: string }[];
  blindSpots: string[];
  flagSummary: string;
}

export interface ConflictPerceptionPart {
  seeEachOther: SeeEachOther;
  conflictDNA: ConflictDNA;
}

/** Returned flat, like the other parts; analysis.ts wraps it into `gapMap`. */
export type GapAnalysisPart = GapMap;

export interface EmotionalCorePart {
  afraidToLose: AfraidToLose;
  uncomfortableTruth: UncomfortableTruth;
  gettingRight: TitledItem[];
}

export interface ActionItemsPart {
  actionPlan: TitledItem[];
  conversationStarters: string[];
}

export function validateOverview(raw: string): OverviewPart {
  const data = parseJsonObject(raw);

  if (!isScore(data.overallScore)) fail("overallScore is not 0-100");
  if (!isNonEmptyString(data.verdict)) fail("verdict is empty");
  if (!isNonEmptyString(data.coupleLine)) fail("coupleLine is empty");

  if (!isStringArray(data.blindSpots) || data.blindSpots.length === 0) {
    fail("blindSpots is empty");
  }
  if (!isNonEmptyString(data.flagSummary)) fail("flagSummary is empty");

  if (!Array.isArray(data.categories) || data.categories.length !== CATEGORY_COUNT) {
    fail(`categories must have ${CATEGORY_COUNT} entries`);
  }
  for (const [i, entry] of data.categories.entries()) {
    const c = entry as Record<string, unknown>;
    if (!isNonEmptyString(c.id)) fail(`categories[${i}].id is empty`);
    if (!isScore(c.score)) fail(`categories[${i}].score is not 0-100`);
    if (!isNonEmptyString(c.headline)) fail(`categories[${i}].headline is empty`);
  }

  return data as unknown as OverviewPart;
}

export function validateConflictPerception(raw: string): ConflictPerceptionPart {
  const data = parseJsonObject(raw);

  const see = data.seeEachOther as Record<string, unknown> | undefined;
  if (!see || typeof see !== "object") fail("seeEachOther is missing");
  if (!isNonEmptyString(see.partner1View)) fail("seeEachOther.partner1View is empty");
  if (!isNonEmptyString(see.partner2View)) fail("seeEachOther.partner2View is empty");
  if (!isNonEmptyString(see.mismatch)) fail("seeEachOther.mismatch is empty");

  const dna = data.conflictDNA as Record<string, unknown> | undefined;
  if (!dna || typeof dna !== "object") fail("conflictDNA is missing");
  if (!isNonEmptyString(dna.pattern)) fail("conflictDNA.pattern is empty");
  if (!isNonEmptyString(dna.description)) fail("conflictDNA.description is empty");
  if (!isNonEmptyString(dna.howItPlaysOut)) fail("conflictDNA.howItPlaysOut is empty");
  if (!isNonEmptyString(dna.advice)) fail("conflictDNA.advice is empty");

  return data as unknown as ConflictPerceptionPart;
}

export function validateGapAnalysis(raw: string): GapAnalysisPart {
  // Tolerate the model wrapping the object in `gapMap` even though the prompt
  // asks for it flat — the fields are what matter.
  const parsed = parseJsonObject(raw);
  const data = (
    parsed.gapMap && typeof parsed.gapMap === "object" ? parsed.gapMap : parsed
  ) as Record<string, unknown>;

  if (!Array.isArray(data.scaleGaps) || data.scaleGaps.length === 0) {
    fail("scaleGaps is empty");
  }
  for (const [i, entry] of data.scaleGaps.entries()) {
    const gap = entry as Record<string, unknown>;
    if (!isNonEmptyString(gap.topic)) fail(`scaleGaps[${i}].topic is empty`);
    if (!isNonEmptyString(gap.partner1Position)) {
      fail(`scaleGaps[${i}].partner1Position is empty`);
    }
    if (!isNonEmptyString(gap.partner2Position)) {
      fail(`scaleGaps[${i}].partner2Position is empty`);
    }
    const size = coerceEnum(gap.gapSize, GAP_SIZES);
    if (!size) fail(`scaleGaps[${i}].gapSize is not one of ${GAP_SIZES.join("/")}`);
    gap.gapSize = size;
    if (!isNonEmptyString(gap.comment)) fail(`scaleGaps[${i}].comment is empty`);
  }

  // Legitimately empty when the couple agreed on every blitz statement.
  if (!Array.isArray(data.blitzSplits)) fail("blitzSplits is not an array");
  for (const [i, entry] of data.blitzSplits.entries()) {
    const split = entry as Record<string, unknown>;
    if (!isNonEmptyString(split.statement)) fail(`blitzSplits[${i}].statement is empty`);
    for (const slot of ["partner1", "partner2"] as const) {
      const verdict = coerceEnum(split[slot], BLITZ_VERDICTS);
      if (!verdict) {
        fail(
          `blitzSplits[${i}].${slot} is not fine/dealbreaker (got ${JSON.stringify(
            split[slot],
          )})`,
        );
      }
      split[slot] = verdict;
    }
    if (!isNonEmptyString(split.insight)) fail(`blitzSplits[${i}].insight is empty`);
  }

  if (!isNonEmptyString(data.overallInsight)) fail("overallInsight is empty");

  return data as unknown as GapAnalysisPart;
}

export function validateEmotionalCore(raw: string): EmotionalCorePart {
  const data = parseJsonObject(raw);

  const afraid = data.afraidToLose as Record<string, unknown> | undefined;
  if (!afraid || typeof afraid !== "object") fail("afraidToLose is missing");
  if (!isNonEmptyString(afraid.partner1)) fail("afraidToLose.partner1 is empty");
  if (!isNonEmptyString(afraid.partner2)) fail("afraidToLose.partner2 is empty");
  if (!isNonEmptyString(afraid.alignment)) fail("afraidToLose.alignment is empty");

  const truth = data.uncomfortableTruth as Record<string, unknown> | undefined;
  if (!truth || typeof truth !== "object") fail("uncomfortableTruth is missing");
  if (!isNonEmptyString(truth.headline)) fail("uncomfortableTruth.headline is empty");
  if (!isNonEmptyString(truth.explanation)) {
    fail("uncomfortableTruth.explanation is empty");
  }

  checkTitledItems(data.gettingRight, "gettingRight", GETTING_RIGHT_COUNT);

  return data as unknown as EmotionalCorePart;
}

export function validateActionItems(raw: string): ActionItemsPart {
  const data = parseJsonObject(raw);

  checkTitledItems(data.actionPlan, "actionPlan");

  if (!isStringArray(data.conversationStarters) || data.conversationStarters.length === 0) {
    fail("conversationStarters is empty");
  }

  return data as unknown as ActionItemsPart;
}

/**
 * Final check on the merged report, so a merge bug can't put a half-built
 * object in front of a paying reader.
 */
export function validateAnalysis(data: unknown): Analysis {
  if (typeof data !== "object" || data === null) fail("top level was not an object");
  const root = data as Record<string, unknown>;

  const teaser = root.teaser as Record<string, unknown> | undefined;
  const full = root.full as Record<string, unknown> | undefined;
  if (!teaser || typeof teaser !== "object") fail("missing `teaser`");
  if (!full || typeof full !== "object") fail("missing `full`");

  if (!isScore(teaser.overallScore)) fail("teaser.overallScore is not 0-100");
  if (!isNonEmptyString(teaser.verdict)) fail("teaser.verdict is empty");
  if (!isNonEmptyString(teaser.coupleLine)) fail("teaser.coupleLine is empty");
  if (!isStringArray(teaser.blindSpots)) fail("teaser.blindSpots is not string[]");
  if (!isNonEmptyString(teaser.flagSummary)) fail("teaser.flagSummary is empty");

  if (!Array.isArray(teaser.categories) || teaser.categories.length !== CATEGORY_COUNT) {
    fail(`teaser.categories must have ${CATEGORY_COUNT} entries`);
  }
  for (const [i, entry] of teaser.categories.entries()) {
    const c = entry as Record<string, unknown>;
    if (!isNonEmptyString(c.id)) fail(`teaser.categories[${i}].id is empty`);
    if (!isNonEmptyString(c.name)) fail(`teaser.categories[${i}].name is empty`);
    if (!isScore(c.score)) fail(`teaser.categories[${i}].score is not 0-100`);
    if (!isNonEmptyString(c.headline)) fail(`teaser.categories[${i}].headline is empty`);
  }

  const see = full.seeEachOther as SeeEachOther | undefined;
  if (!see?.partner1View || !see.partner2View || !see.mismatch) {
    fail("full.seeEachOther is incomplete");
  }

  const dna = full.conflictDNA as ConflictDNA | undefined;
  if (!dna?.pattern || !dna.description || !dna.howItPlaysOut || !dna.advice) {
    fail("full.conflictDNA is incomplete");
  }

  const map = full.gapMap as GapMap | undefined;
  if (!map || !Array.isArray(map.scaleGaps) || !Array.isArray(map.blitzSplits)) {
    fail("full.gapMap is incomplete");
  }
  if (!isNonEmptyString(map.overallInsight)) fail("full.gapMap.overallInsight is empty");
  for (const [i, split] of (map.blitzSplits as BlitzSplit[]).entries()) {
    if (split.partner1 !== "fine" && split.partner1 !== "dealbreaker") {
      fail(`full.gapMap.blitzSplits[${i}].partner1 is invalid`);
    }
    if (split.partner2 !== "fine" && split.partner2 !== "dealbreaker") {
      fail(`full.gapMap.blitzSplits[${i}].partner2 is invalid`);
    }
  }

  const afraid = full.afraidToLose as AfraidToLose | undefined;
  if (!afraid?.partner1 || !afraid.partner2 || !afraid.alignment) {
    fail("full.afraidToLose is incomplete");
  }

  const truth = full.uncomfortableTruth as UncomfortableTruth | undefined;
  if (!truth?.headline || !truth.explanation) fail("full.uncomfortableTruth is incomplete");

  checkTitledItems(full.gettingRight, "full.gettingRight", GETTING_RIGHT_COUNT);
  checkTitledItems(full.actionPlan, "full.actionPlan");

  if (!isStringArray(full.conversationStarters) || full.conversationStarters.length === 0) {
    fail("full.conversationStarters is empty");
  }

  return data as Analysis;
}
