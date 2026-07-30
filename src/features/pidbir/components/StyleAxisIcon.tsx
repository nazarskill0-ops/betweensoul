import type { StyleAxis, StyleValue } from "../schema";

/*
  Іконки варіантів відповіді — власна параметрична система, не емодзі.
  Кожна вісь має свій базовий гліф, а позиція на шкалі (1..5) міняє його
  форму, тож набір читається як шкала, а не як випадкові картинки.
*/

const SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Структура: рівні паралельні лінії поступово стають хвилястими. */
function StructureGlyph({ value }: { value: StyleValue }) {
  const waviness = (value - 1) / 4; // 0 — строгий план, 1 — вільний потік
  const amplitude = waviness * 3;

  return (
    <svg {...SVG_PROPS}>
      {[7, 12, 17].map((y) => (
        <path
          key={y}
          d={
            amplitude === 0
              ? `M4 ${y}h16`
              : `M4 ${y}c3 -${amplitude} 5 ${amplitude} 8 0s5 ${amplitude} 8 0`
          }
        />
      ))}
    </svg>
  );
}

/**
 * Роль терапевта: два кола — ліворуч клієнт, праворуч терапевт.
 * Що вище значення, то активніший терапевт: його коло росте, клієнта — меншає.
 */
function LeadGlyph({ value }: { value: StyleValue }) {
  const t = (value - 1) / 4;
  const clientR = 6 - t * 3;
  const therapistR = 3 + t * 3;

  return (
    <svg {...SVG_PROPS}>
      <circle cx={7.5} cy={12} r={clientR} />
      <circle cx={16.5} cy={12} r={therapistR} />
    </svg>
  );
}

/**
 * Фокус у часі: шкала з міткою. Праворуч — «зараз», ліворуч — минуле;
 * що глибше фокус, то далі мітка вліво і то більше з'являється глибинних рисок.
 */
function TimeFocusGlyph({ value }: { value: StyleValue }) {
  const markerX = 19 - ((value - 1) / 4) * 14;
  const depthTicks = value - 1;

  return (
    <svg {...SVG_PROPS}>
      <path d="M4 9h16" />
      <circle cx={markerX} cy={9} r={2.25} fill="currentColor" stroke="none" />
      {Array.from({ length: depthTicks }).map((_, i) => (
        <path key={i} d={`M${5 + i * 3.5} 14v${3 + i}`} opacity={0.55} />
      ))}
    </svg>
  );
}

export function StyleAxisIcon({
  axis,
  value,
  className,
}: {
  axis: StyleAxis;
  value: StyleValue;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden>
      {axis === "structure" && <StructureGlyph value={value} />}
      {axis === "lead" && <LeadGlyph value={value} />}
      {axis === "timeFocus" && <TimeFocusGlyph value={value} />}
    </span>
  );
}
