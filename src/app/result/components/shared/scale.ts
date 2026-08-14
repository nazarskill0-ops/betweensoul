import { DimensionId, RiskLevel, ScenarioId } from "@/lib/types";

/**
 * One score scale for the whole report.
 *
 * Every number the reader sees — the couple score, the eight radar dimensions,
 * the scenario compatibilities — is coloured by the same five bands, so a 74 in
 * one section means the same thing as a 74 in another.
 *
 * `text` is a darker shade than `bar` on purpose: the vivid fill reads well as
 * a block of colour but fails contrast as small text on white.
 */
export interface ScoreBand {
  label: string;
  /** Fill colour for bars and rings. */
  bar: string;
  /** Text colour, dark enough to read at body size. */
  text: string;
  /** Tinted background for the score chip. */
  chip: string;
  /** Raw hex, for the SVG gradient in the score ring. */
  hex: string;
}

export function scoreBand(score: number): ScoreBand {
  if (score >= 80) {
    return {
      label: "Strong",
      bar: "bg-green-500",
      text: "text-green-700",
      chip: "bg-green-50",
      hex: "#22c55e",
    };
  }
  if (score >= 60) {
    return {
      label: "Solid",
      bar: "bg-blue-500",
      text: "text-blue-700",
      chip: "bg-blue-50",
      hex: "#3b82f6",
    };
  }
  if (score >= 40) {
    return {
      label: "Mixed",
      bar: "bg-amber-500",
      text: "text-amber-700",
      chip: "bg-amber-50",
      hex: "#f59e0b",
    };
  }
  if (score >= 20) {
    return {
      label: "Strained",
      bar: "bg-orange-500",
      text: "text-orange-700",
      chip: "bg-orange-50",
      hex: "#f97316",
    };
  }
  return {
    label: "Critical",
    bar: "bg-red-500",
    text: "text-red-700",
    chip: "bg-red-50",
    hex: "#ef4444",
  };
}

/** One glyph per dimension, so the radar scans as a list of things not numbers. */
export const DIMENSION_EMOJI: Record<DimensionId, string> = {
  emotional_connection: "💗",
  communication: "💬",
  trust: "🤝",
  chemistry: "🔥",
  conflict: "🌩️",
  shared_future: "🧭",
  independence: "🕊️",
  playfulness: "🎈",
};

/**
 * The named risk levels, in the same three colours the score bands use for the
 * equivalent range — so "high" on a scenario card reads as the same kind of bad
 * as a red score, and the page has one visual vocabulary rather than two.
 *
 * A level and never a percentage: see `IfNothingChanges` in types.ts.
 */
export const RISK_BADGE: Record<
  RiskLevel,
  { emoji: string; label: string; chip: string; text: string }
> = {
  low: { emoji: "🟢", label: "Low risk", chip: "bg-green-50", text: "text-green-700" },
  moderate: {
    emoji: "🟡",
    label: "Moderate risk",
    chip: "bg-amber-50",
    text: "text-amber-700",
  },
  high: { emoji: "🔴", label: "High risk", chip: "bg-red-50", text: "text-red-700" },
};

export const SCENARIO_EMOJI: Record<ScenarioId, string> = {
  living_together: "🏠",
  long_distance: "✈️",
  financial_stress: "💸",
  major_life_change: "🔄",
  having_a_child: "👶",
};
