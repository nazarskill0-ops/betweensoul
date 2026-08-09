import {
  BiggestQuestion,
  CATEGORY_IDS,
  CATEGORY_LABELS,
  CategoryId,
  FreeReport,
  PaidReport,
} from "@/lib/types";

/**
 * Turns Claude's raw text into validated data.
 *
 * Two validators, one per pass: `validateFreeReport` for the Haiku overview
 * generated on submit, `validatePaidReport` for the Sonnet deep dive generated
 * after payment.
 *
 * We ask for bare JSON in the prompt, but a prompt is a request, not a
 * guarantee — unlike `output_config.format`, nothing at the API level enforces
 * the shape. So this both tolerates the usual deviations (markdown fences,
 * a sentence of preamble) and validates the result, rather than letting a
 * malformed report reach the result page as `undefined` everywhere.
 *
 * Throws with a specific reason; the route turns that into a 500.
 */


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
 * Free tier — Haiku, generated on submit.
 * ----------------------------------------------------------------------- */

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
 * Lines the model's category list up with CATEGORY_IDS: by id first, then by
 * position for whatever is left. A run where Haiku renamed a category still
 * produces a usable report instead of failing outright.
 */
function alignCategories(
  items: { id?: unknown; score?: unknown; headline?: unknown }[],
): FreeReport["categories"] {
  const aligned: (typeof items[number] | undefined)[] = CATEGORY_IDS.map(() => undefined);
  const unmatched: typeof items = [];

  for (const item of items) {
    const key = typeof item.id === "string" ? normalizeId(item.id) : "";
    const canonical = (CATEGORY_IDS as readonly string[]).includes(key)
      ? (key as CategoryId)
      : ID_ALIASES[key];
    const index = canonical ? CATEGORY_IDS.indexOf(canonical) : -1;

    if (index !== -1 && !aligned[index]) aligned[index] = item;
    else unmatched.push(item);
  }

  for (let i = 0; i < aligned.length && unmatched.length; i++) {
    if (!aligned[i]) aligned[i] = unmatched.shift();
  }

  // The label comes from CATEGORY_LABELS, never the model, so the UI can't
  // show a category renamed mid-run.
  return CATEGORY_IDS.map((id, i) => {
    const entry = aligned[i];
    return {
      id,
      name: CATEGORY_LABELS[id],
      score: isScore(entry?.score) ? (entry!.score as number) : 0,
      headline: isNonEmptyString(entry?.headline) ? (entry!.headline as string) : "",
    };
  });
}

export function validateFreeReport(raw: string): FreeReport {
  const data = parseJsonObject(raw);

  if (!isScore(data.overallScore)) fail("overallScore is not 0-100");
  if (!isNonEmptyString(data.verdict)) fail("verdict is empty");
  if (!isNonEmptyString(data.flagSummary)) fail("flagSummary is empty");

  const dynamic = data.hiddenDynamic as Record<string, unknown> | undefined;
  if (!dynamic || typeof dynamic !== "object") fail("hiddenDynamic is missing");
  if (!isNonEmptyString(dynamic.type)) fail("hiddenDynamic.type is empty");
  if (!isNonEmptyString(dynamic.description)) fail("hiddenDynamic.description is empty");

  if (!Array.isArray(data.categories) || data.categories.length !== CATEGORY_IDS.length) {
    fail(`categories must have ${CATEGORY_IDS.length} entries`);
  }
  for (const [i, entry] of data.categories.entries()) {
    const c = entry as Record<string, unknown>;
    if (!isScore(c.score)) fail(`categories[${i}].score is not 0-100`);
    if (!isNonEmptyString(c.headline)) fail(`categories[${i}].headline is empty`);
  }

  return {
    overallScore: data.overallScore,
    verdict: data.verdict,
    hiddenDynamic: {
      type: (dynamic.type as string).trim(),
      description: (dynamic.description as string).trim(),
    },
    categories: alignCategories(data.categories as Record<string, unknown>[]),
    flagSummary: data.flagSummary,
  };
}

/* -------------------------------------------------------------------------
 * Paid tier — Sonnet, generated after payment.
 * ----------------------------------------------------------------------- */

/** Reads a required object field, failing with the field's own name. */
function requireObject(data: Record<string, unknown>, field: string): Record<string, unknown> {
  const value = data[field];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${field} is missing`);
  }
  return value as Record<string, unknown>;
}

/** Reads required non-empty strings off an object, failing on the first gap. */
function requireStrings<K extends string>(
  source: Record<string, unknown>,
  field: string,
  keys: readonly K[],
): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of keys) {
    if (!isNonEmptyString(source[key])) fail(`${field}.${key} is empty`);
    out[key] = (source[key] as string).trim();
  }
  return out;
}

/**
 * Every paid section but one is a fixed set of required prose fields, so the
 * schema is a table rather than eight near-identical blocks.
 *
 * The `satisfies` keeps the table honest: a misspelled field or a section
 * missing from PaidReport is a compile error here, not a runtime surprise.
 */
type SectionFields = {
  [K in keyof Omit<PaidReport, "biggestQuestion">]: readonly (keyof PaidReport[K])[];
};

const PAID_SECTIONS = {
  biggestSurprise: ["insight"],
  seeEachOther: ["partner1View", "partner2View", "dynamic"],
  biggestMisunderstanding: ["partner1Thinks", "partner2Experiences"],
  conflictDNA: ["pattern", "trigger", "escalation", "aftermath", "insight"],
  howYouLove: ["partner1", "partner2", "friction"],
  ifNothingChanges: ["prediction", "why"],
  whatKeepsYouTogether: ["core", "evidence"],
} as const satisfies SectionFields;

export function validatePaidReport(raw: string): PaidReport {
  const data = parseJsonObject(raw);

  const sections = Object.fromEntries(
    Object.entries(PAID_SECTIONS).map(([field, keys]) => [
      field,
      requireStrings(requireObject(data, field), field, keys),
    ]),
    // Safe: the table above is checked against PaidReport, and requireStrings
    // has just proved every listed field is a non-empty string.
  ) as unknown as Omit<PaidReport, "biggestQuestion">;

  // The odd one out: prose plus a list of starters.
  const rawQuestion = requireObject(data, "biggestQuestion");
  const { question } = requireStrings(rawQuestion, "biggestQuestion", [
    "question",
  ] as const);
  if (
    !isStringArray(rawQuestion.conversationStarters) ||
    rawQuestion.conversationStarters.length === 0
  ) {
    fail("biggestQuestion.conversationStarters is empty");
  }
  const biggestQuestion: BiggestQuestion = {
    question,
    conversationStarters: rawQuestion.conversationStarters,
  };

  return { ...sections, biggestQuestion };
}
