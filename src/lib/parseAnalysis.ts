import {
  ConflictFingerprint,
  CoupleDynamic,
  CoupleScore,
  DIMENSION_IDS,
  DIMENSION_LABELS,
  Flags,
  FullPerceptionGap,
  Highlight,
  HowYouSeeEachOther,
  IfNothingChanges,
  LoveStyles,
  PartnerRef,
  PerceptionGap,
  Radar,
  RiskLevel,
  SCENARIO_IDS,
  SCENARIO_LABELS,
  SLIDER_QUESTIONS,
  ScenarioAnalysis,
  ScenarioPreview,
  ScenarioStatus,
  Slider,
  TheAnswer,
  UnsaidThingFull,
  UnsaidThings,
  WhatKeepsYouTogether,
} from "@/lib/types";

/**
 * Turns Claude's raw text into validated data — one validator per request.
 *
 * We ask for bare JSON in the prompt, but a prompt is a request, not a
 * guarantee: nothing at the API level enforces the shape. So this tolerates the
 * usual deviations (markdown fences, a sentence of preamble, an unescaped quote
 * inside a value) and then checks the result, rather than letting a malformed
 * report reach the page as `undefined` everywhere.
 *
 * Anything with a fixed vocabulary — dimension ids, scenario ids, slider
 * wording, section labels — is taken from types.ts and not from the model, so a
 * run that renames or reorders them still lands in the right slot.
 *
 * Throws with a specific reason; the caller retries, then gives up.
 */

/* ------------------------------ json recovery ----------------------------- */

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

function fail(reason: string): never {
  throw new Error(`Malformed analysis: ${reason}`);
}

/** Raw model text -> a JSON object, with the usual deviations tolerated. */
export function parseJsonObject(raw: string): Record<string, unknown> {
  if (typeof raw !== "string" || !raw.trim()) fail("model returned no text");

  const cleaned = stripToJson(raw);

  // Each pass repairs one more class of defect. Order matters: a well-formed
  // response never goes through any of them.
  let data: unknown;
  let parsed = false;
  let firstError: unknown;

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
    // Report the original failure — it describes the actual defect, whereas a
    // repaired pass's error is about text we rewrote.
    fail(
      `response was not valid JSON (${
        firstError instanceof Error ? firstError.message : "unknown parse error"
      })`,
    );
  }

  if (typeof data !== "object" || data === null) fail("top level was not an object");
  return data as Record<string, unknown>;
}

/* -------------------------------- helpers --------------------------------- */

type Obj = Record<string, unknown>;

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

/** Reads a required object field, failing with the field's own name. */
function requireObject(data: Obj, field: string): Obj {
  const value = data[field];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${field} is missing`);
  }
  return value as Obj;
}

function requireArray(data: Obj, field: string): unknown[] {
  const value = data[field];
  if (!Array.isArray(value) || value.length === 0) fail(`${field} is empty`);
  return value;
}

/** Reads required non-empty strings off an object, failing on the first gap. */
function requireStrings<K extends string>(
  source: Obj,
  field: string,
  keys: readonly K[],
): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of keys) {
    if (!isText(source[key])) fail(`${field}.${key} is empty`);
    out[key] = (source[key] as string).trim();
  }
  return out;
}

function requireScore(source: Obj, field: string, key: string): number {
  if (!isScore(source[key])) fail(`${field}.${key} is not 0-100`);
  return Math.round(source[key] as number);
}

/** Short list of short strings — green flags, anchors, starters. */
function requireTextList(source: Obj, field: string, min: number): string[] {
  const raw = requireArray(source, field);
  const items = raw.filter(isText).map((item) => item.trim());
  if (items.length < min) fail(`${field} needs at least ${min} items`);
  return items;
}

/** Loose match so "Emotional Connection" or "emotional-connection" still lands. */
function normalizeId(id: unknown): string {
  return typeof id === "string" ? id.toLowerCase().replace(/[^a-z]/g, "") : "";
}

/**
 * Lines a returned list up with a fixed id list: by id first, then by position
 * for whatever is left over. A run where the model renamed one entry still
 * produces a usable section instead of failing outright.
 */
function alignToIds<Id extends string>(
  items: unknown[],
  ids: readonly Id[],
  field: string,
): Obj[] {
  const aligned: (Obj | undefined)[] = ids.map(() => undefined);
  const unmatched: Obj[] = [];

  for (const raw of items) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Obj;
    const key = normalizeId(item.id ?? item.dimensionId);
    const index = ids.findIndex((id) => normalizeId(id) === key);

    if (index !== -1 && !aligned[index]) aligned[index] = item;
    else unmatched.push(item);
  }

  for (let i = 0; i < aligned.length && unmatched.length; i++) {
    if (!aligned[i]) aligned[i] = unmatched.shift();
  }

  const missing = ids.filter((_, i) => !aligned[i]);
  if (missing.length) fail(`${field} is missing ${missing.join(", ")}`);
  return aligned as Obj[];
}

/* --------------------------- free 1: score + dynamic ---------------------- */

export interface ScoreDynamicResult {
  coupleScore: CoupleScore;
  coupleDynamic: CoupleDynamic;
}

export function validateScoreDynamic(raw: string): ScoreDynamicResult {
  const data = parseJsonObject(raw);

  const score = requireObject(data, "coupleScore");
  const dynamic = requireObject(data, "coupleDynamic");

  return {
    coupleScore: {
      overall: requireScore(score, "coupleScore", "overall"),
      connection: requireScore(score, "coupleScore", "connection"),
      stability: requireScore(score, "coupleScore", "stability"),
      chemistry: requireScore(score, "coupleScore", "chemistry"),
      ...requireStrings(score, "coupleScore", ["insight"] as const),
    },
    coupleDynamic: requireStrings(dynamic, "coupleDynamic", [
      "name",
      "description",
    ] as const),
  };
}

/* ------------------- free 2: radar + strength + tension ------------------- */

export interface RadarResult {
  radar: Radar;
  biggestStrength: Highlight;
  biggestTension: Highlight;
}

export function validateRadar(raw: string): RadarResult {
  const data = parseJsonObject(raw);

  const radarRaw = requireObject(data, "radar");
  const aligned = alignToIds(
    requireArray(radarRaw, "dimensions"),
    DIMENSION_IDS,
    "radar.dimensions",
  );

  const dimensions = DIMENSION_IDS.map((id, i) => ({
    id,
    // The label is ours, so the UI can't show a dimension renamed mid-run.
    name: DIMENSION_LABELS[id],
    score: requireScore(aligned[i], `radar.dimensions.${id}`, "score"),
    ...requireStrings(aligned[i], `radar.dimensions.${id}`, ["insight"] as const),
  }));

  // The model is asked to point strength and tension at its own highest and
  // lowest dimension and does not reliably do it, so the extremes are taken
  // from the scores themselves. The prose stays; only the target is corrected.
  const ranked = [...dimensions].sort((a, b) => b.score - a.score);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];

  const strengthRaw = requireObject(data, "biggestStrength");
  const tensionRaw = requireObject(data, "biggestTension");

  return {
    radar: { dimensions },
    biggestStrength: {
      dimensionId: highest.id,
      dimensionName: highest.name,
      score: highest.score,
      ...requireStrings(strengthRaw, "biggestStrength", ["explanation"] as const),
    },
    biggestTension: {
      dimensionId: lowest.id,
      dimensionName: lowest.name,
      score: lowest.score,
      ...requireStrings(tensionRaw, "biggestTension", ["explanation"] as const),
    },
  };
}

/* --------------------- free 3: sliders + perception gap ------------------- */

export interface SlidersGapsResult {
  sliders: Slider[];
  perceptionGap: PerceptionGap;
}

export function validateSlidersGaps(raw: string): SlidersGapsResult {
  const data = parseJsonObject(raw);

  const rawSliders = requireArray(data, "sliders");
  if (rawSliders.length < SLIDER_QUESTIONS.length) {
    fail(`sliders needs ${SLIDER_QUESTIONS.length} entries`);
  }

  // Wording comes from SLIDER_QUESTIONS; only the position is the model's.
  const sliders = SLIDER_QUESTIONS.map((question, i) => {
    const item = rawSliders[i] as Obj;
    if (typeof item !== "object" || item === null) fail(`sliders[${i}] is not an object`);
    return {
      question,
      partner1Position: requireScore(item, `sliders[${i}]`, "partner1Position"),
    };
  });

  const gapRaw = requireObject(data, "perceptionGap");
  const shown = requireArray(gapRaw, "shown").map((entry, i) => {
    const item = entry as Obj;
    if (typeof item !== "object" || item === null) {
      fail(`perceptionGap.shown[${i}] is not an object`);
    }
    return requireStrings(item, `perceptionGap.shown[${i}]`, [
      "topic",
      "partner1Said",
      "partner2Said",
      "aiComment",
    ] as const);
  });

  // The teaser must not promise fewer gaps than are already on screen.
  const claimed = typeof gapRaw.totalGapsFound === "number" ? gapRaw.totalGapsFound : 0;
  const totalGapsFound = Math.min(5, Math.max(shown.length, Math.round(claimed)));

  return { sliders, perceptionGap: { shown, totalGapsFound } };
}

/* ---------------------- free 4: unsaid things + flags --------------------- */

export interface UnsaidFlagsResult {
  unsaidThings: UnsaidThings;
  flags: Flags;
}

export function validateUnsaidFlags(raw: string): UnsaidFlagsResult {
  const data = parseJsonObject(raw);

  const unsaidRaw = requireObject(data, "unsaidThings");
  const flagsRaw = requireObject(data, "flags");

  const text = requireStrings(unsaidRaw, "unsaidThings", [
    "shown",
    "lockedTeaser",
  ] as const);

  // "partner2", "Partner 2", the name itself with a 2 in it — anything else
  // falls to partner 1. This only picks which colour the line is shown in, and
  // the wrong colour is a better outcome than a failed report.
  const about = String(unsaidRaw.about ?? "").includes("2")
    ? "partner2"
    : "partner1";

  return {
    unsaidThings: { about, ...text },
    // Capped as well as floored: the chips are a glance, and nine of them is a
    // list again. Four and three is the most the section can carry.
    flags: {
      greenFlags: requireTextList(flagsRaw, "greenFlags", 3).slice(0, 4),
      watchOuts: requireTextList(flagsRaw, "watchOuts", 1).slice(0, 3),
    },
  };
}

/* ----------------------------- free 5: scenarios -------------------------- */

export interface ScenariosResult {
  scenarios: ScenarioPreview[];
}

/** Unrecognised statuses read as "watch" — the badge that claims the least. */
function scenarioStatus(value: unknown): ScenarioStatus {
  const normalized = normalizeId(value);
  if (normalized === "good") return "good";
  if (normalized === "risk") return "risk";
  return "watch";
}

export function validateScenarios(raw: string): ScenariosResult {
  const data = parseJsonObject(raw);

  const aligned = alignToIds(requireArray(data, "scenarios"), SCENARIO_IDS, "scenarios");
  const scenarios = SCENARIO_IDS.map((id, i) => ({
    id,
    name: SCENARIO_LABELS[id],
    status: scenarioStatus(aligned[i].status),
    ...requireStrings(aligned[i], `scenarios.${id}`, ["teaser"] as const),
  }));

  return { scenarios };
}

/* -------------------------- paid: shared helpers -------------------------- */

/** Anything that isn't a recognised level reads as the middle one. */
function riskLevel(value: unknown): RiskLevel {
  const normalized = normalizeId(value);
  if (normalized === "low") return "low";
  if (normalized === "high") return "high";
  return "moderate";
}

/** Same rule as the free half: only an explicit 2 means partner 2. */
function partnerRef(value: unknown): PartnerRef {
  return String(value ?? "").includes("2") ? "partner2" : "partner1";
}

function requireObjectAt(source: unknown, field: string): Obj {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    fail(`${field} is not an object`);
  }
  return source as Obj;
}

/* ------------------ paid 1: unsaid things + every gap --------------------- */

export interface UnsaidGapsResult {
  unsaidThings: UnsaidThingFull[];
  allPerceptionGaps: FullPerceptionGap[];
}

export function validateUnsaidGaps(raw: string): UnsaidGapsResult {
  const data = parseJsonObject(raw);

  /**
   * Three is what the section is sold as, and the count is in its own title.
   * A run that returns four is trimmed; one that returns two fails, because
   * showing a buyer two things under a heading promising three is the one
   * outcome worth refusing — the caller retries, then falls back to Haiku.
   */
  const things = requireArray(data, "unsaidThings").map((entry, i) => {
    const item = requireObjectAt(entry, `unsaidThings[${i}]`);
    return {
      about: partnerRef(item.about),
      ...requireStrings(item, `unsaidThings[${i}]`, [
        "thing",
        "whyThisMatters",
      ] as const),
    };
  });
  if (things.length < 3) fail("unsaidThings needs 3 items");

  const gaps = requireArray(data, "allPerceptionGaps").map((entry, i) => {
    const item = requireObjectAt(entry, `allPerceptionGaps[${i}]`);
    return requireStrings(item, `allPerceptionGaps[${i}]`, [
      "topic",
      "partner1Said",
      "partner2Said",
      "whyItMatters",
    ] as const);
  });

  return { unsaidThings: things.slice(0, 3), allPerceptionGaps: gaps };
}

/* ---------------- paid 2: conflict fingerprint + love styles -------------- */

export interface ConflictLoveResult {
  conflictFingerprint: ConflictFingerprint;
  loveStyles: LoveStyles;
}

export function validateConflictLove(raw: string): ConflictLoveResult {
  const data = parseJsonObject(raw);

  return {
    conflictFingerprint: requireStrings(
      requireObject(data, "conflictFingerprint"),
      "conflictFingerprint",
      [
        "trigger",
        "reaction",
        "escalation",
        "withdrawal",
        "aftermath",
        "repeat",
      ] as const,
    ),
    loveStyles: requireStrings(requireObject(data, "loveStyles"), "loveStyles", [
      "partner1Shows",
      "partner1FeelsLovedBy",
      "partner1Gap",
      "partner2Shows",
      "partner2FeelsLovedBy",
      "partner2Gap",
    ] as const),
  };
}

/* ------------------ paid 3: how you see each other + scenarios ------------ */

export interface MirrorScenarioResult {
  howYouSeeEachOther: HowYouSeeEachOther;
  scenarioLab: ScenarioAnalysis[];
}

export function validateMirrorScenario(raw: string): MirrorScenarioResult {
  const data = parseJsonObject(raw);

  const mirror = requireObject(data, "howYouSeeEachOther");

  const aligned = alignToIds(
    requireArray(data, "scenarioLab"),
    SCENARIO_IDS,
    "scenarioLab",
  );

  return {
    howYouSeeEachOther: {
      // Three lines is the design; a fourth is dropped rather than allowed to
      // turn a facing pair of bullet lists into an uneven one.
      partner1SeesPartner2: requireTextList(
        mirror,
        "partner1SeesPartner2",
        2,
      ).slice(0, 3),
      partner2SeesPartner1: requireTextList(
        mirror,
        "partner2SeesPartner1",
        2,
      ).slice(0, 3),
      ...requireStrings(mirror, "howYouSeeEachOther", ["surprise"] as const),
    },
    scenarioLab: SCENARIO_IDS.map((id, i) => ({
      id,
      name: SCENARIO_LABELS[id],
      risk: riskLevel(aligned[i].risk),
      ...requireStrings(aligned[i], `scenarioLab.${id}`, ["analysis"] as const),
    })),
  };
}

/* -------------- paid 4: projection + what keeps you together -------------- */

export interface FutureResult {
  ifNothingChanges: IfNothingChanges;
  whatKeepsYouTogether: WhatKeepsYouTogether;
}

export function validateFuture(raw: string): FutureResult {
  const data = parseJsonObject(raw);

  const projection = requireObject(data, "ifNothingChanges");
  const anchors = requireObject(data, "whatKeepsYouTogether");

  return {
    ifNothingChanges: {
      ...requireStrings(projection, "ifNothingChanges", [
        "sixMonths",
        "twelveMonths",
        "turningPoint",
      ] as const),
      strain: riskLevel(projection.strain),
    },
    whatKeepsYouTogether: {
      ...requireStrings(anchors, "whatKeepsYouTogether", [
        "mainForce",
        "watchOutFor",
        "isItEnough",
      ] as const),
      alsoHolding: requireTextList(anchors, "alsoHolding", 1).slice(0, 3),
    },
  };
}

/* ------------------------------ paid 5: the answer ------------------------ */

export interface AnswerResult {
  theAnswer: TheAnswer;
}

export function validateAnswer(raw: string): AnswerResult {
  const data = parseJsonObject(raw);

  return {
    theAnswer: requireStrings(requireObject(data, "theAnswer"), "theAnswer", [
      "shortAnswer",
      "verdict",
      "biggestOpportunity",
      "conversationToHave",
    ] as const),
  };
}
