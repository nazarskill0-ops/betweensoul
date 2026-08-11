import { Gender } from "@/lib/types";

/**
 * Which two colours stand for the two partners.
 *
 * Everything that shows them side by side — the sliders, the perception gaps,
 * the quiz's own answer chips — reads the four CSS variables below rather than
 * hard-coded values, so the pair is chosen once here and the components never
 * have to know which one they are drawing.
 *
 * A man-and-woman couple gets the pink/blue pair, because that is the reading
 * people expect and it carries meaning for them. Any other couple gets a pair
 * that carries none: two same-gender partners would be told apart by a colour
 * scheme that says nothing about them, and someone who chose non-binary or
 * declined to say should not be sorted into one of two boxes by the interface.
 */

export interface PartnerPalette {
  p1: string;
  p1Soft: string;
  p2: string;
  p2Soft: string;
}

const PINK = { solid: "#f472b6", soft: "#fdf2f8" };
const BLUE = { solid: "#5b7fff", soft: "#eef2ff" };
const ACCENT = { solid: "#e84067", soft: "#fdeef2" };
const TEAL = { solid: "#2a9d8f", soft: "#e6f4f1" };

const NEUTRAL_PAIR: PartnerPalette = {
  p1: ACCENT.solid,
  p1Soft: ACCENT.soft,
  p2: TEAL.solid,
  p2Soft: TEAL.soft,
};

export function partnerPalette(
  partner1Gender: Gender | "" | undefined,
  partner2Gender: Gender | "" | undefined,
): PartnerPalette {
  const pair = [partner1Gender, partner2Gender];
  const isManAndWoman =
    pair.includes("male") && pair.includes("female");

  if (!isManAndWoman) return NEUTRAL_PAIR;

  // Pink follows the woman and blue the man, whichever of them answered first
  // — assigning by position instead would hand the pink to whoever happened to
  // fill in the left-hand column.
  const partner1IsWoman = partner1Gender === "female";
  const first = partner1IsWoman ? PINK : BLUE;
  const second = partner1IsWoman ? BLUE : PINK;

  return {
    p1: first.solid,
    p1Soft: first.soft,
    p2: second.solid,
    p2Soft: second.soft,
  };
}

/**
 * The palette as inline custom properties, to spread onto a wrapper element:
 *
 *   <div style={partnerPaletteStyle(g1, g2)}> … </div>
 *
 * Everything inside picks the colours up through `var(--color-p1)` and friends,
 * which is what globals.css defines defaults for.
 */
export function partnerPaletteStyle(
  partner1Gender: Gender | "" | undefined,
  partner2Gender: Gender | "" | undefined,
): React.CSSProperties {
  const palette = partnerPalette(partner1Gender, partner2Gender);
  return {
    "--color-p1": palette.p1,
    "--color-p1-soft": palette.p1Soft,
    "--color-p2": palette.p2,
    "--color-p2-soft": palette.p2Soft,
  } as React.CSSProperties;
}
