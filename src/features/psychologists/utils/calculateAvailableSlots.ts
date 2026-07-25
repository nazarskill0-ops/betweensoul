/*
  Чиста функція розрахунку вільних слотів на день — варіант "контрольні
  точки", а не послідовні незалежні цикли.

  Замість того, щоб генерувати слоти циклом (тривалість+перерва) від початку
  кожного вільного шматка часу (де одне бронювання посеред дня непередбачувано
  зсуває час усіх наступних слотів), кандидати перевіряються на ФІКСОВАНИХ
  контрольних точках через рівний крок (`controlPointStepMinutes` — власна
  настройка психолога "Крок часу для запису" з профілю, за замовчуванням
  60 хв, або 30 хв) у межах робочого вікна — 9:00, 9:30/10:00, ...
  незалежно від того, що вже заброньовано. Обов'язковий параметр, без
  внутрішнього дефолту — щоб не розходитись мовчки зі збереженою настройкою.

  Контрольна точка валідна для типу сесії, якщо [точка, точка + тривалість +
  перерва) не перетинається з жодним зайнятим інтервалом (бронювання чи ручне
  блокування) — сама сесія при цьому мусить вміститись у робоче вікно, а
  "хвіст" перерви за межі робочого дня виходити може (там нема наступної
  сесії, яку потрібно берегти).

  Наслідок: індивідуальні й парні слоти завжди пропонуються на тих самих
  "гарних" позначках, незалежно одне від одного і незалежно від того, що вже
  заброньовано — жодного ефекту "все зсунулось на 10 хвилин" після одного
  бронювання. Частина часу між контрольними точками при цьому може лишитись
  невикористаною (фрагментація) — свідомо прийнятий компроміс.

  Без стану й побічних ефектів — викликати щоразу, коли потрібен актуальний
  розклад, кешувати результат нема потреби.
*/

export type TimeInterval = { start: string; end: string }; // "HH:MM", 24-годинний формат

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type MinuteInterval = { start: number; end: number };

/** Контрольні точки в межах робочого вікна — windowStart, +step, +step, ... поки < windowEnd. */
function generateControlPoints(
  windowStart: number,
  windowEnd: number,
  stepMinutes: number
): number[] {
  const points: number[] = [];
  for (let m = windowStart; m < windowEnd; m += stepMinutes) points.push(m);
  return points;
}

/**
 * Контрольна точка валідна для сесії заданої тривалості, якщо:
 * 1) сама сесія (без перерви) вміщується в робоче вікно;
 * 2) [точка, точка + тривалість + перерва) не перетинається з жодним
 *    зайнятим інтервалом — перетин з межею робочого дня тут не рахується,
 *    бо це не "зайнятий інтервал".
 */
function isValidControlPoint(
  point: number,
  durationMinutes: number,
  breakMinutes: number,
  windowEnd: number,
  busyIntervals: MinuteInterval[]
): boolean {
  if (point + durationMinutes > windowEnd) return false;

  const slotEndWithBreak = point + durationMinutes + breakMinutes;
  return !busyIntervals.some((b) => point < b.end && b.start < slotEndWithBreak);
}

export type AvailableSlots = {
  individual: TimeInterval[];
  couple: TimeInterval[];
};

/**
 * Робоче вікно дня + всі зайняті інтервали → вільні слоти окремо для
 * індивідуальних і парних сесій, на спільних контрольних точках.
 * `coupleDurationMinutes: null`, якщо психолог не проводить парні сесії —
 * тоді `couple` завжди порожній.
 */
export function calculateAvailableSlots(params: {
  workingWindow: TimeInterval | null;
  busyIntervals: TimeInterval[];
  individualDurationMinutes: number;
  coupleDurationMinutes: number | null;
  breakMinutes: number;
  controlPointStepMinutes: number;
}): AvailableSlots {
  const {
    workingWindow,
    busyIntervals,
    individualDurationMinutes,
    coupleDurationMinutes,
    breakMinutes,
    controlPointStepMinutes,
  } = params;

  if (!workingWindow) return { individual: [], couple: [] };

  const windowStart = toMinutes(workingWindow.start);
  const windowEnd = toMinutes(workingWindow.end);
  if (windowEnd <= windowStart) return { individual: [], couple: [] };

  const busy: MinuteInterval[] = busyIntervals.map((b) => ({
    start: toMinutes(b.start),
    end: toMinutes(b.end),
  }));

  const controlPoints = generateControlPoints(windowStart, windowEnd, controlPointStepMinutes);

  function slotsFor(durationMinutes: number | null): TimeInterval[] {
    if (durationMinutes == null || durationMinutes <= 0) return [];
    return controlPoints
      .filter((p) => isValidControlPoint(p, durationMinutes, breakMinutes, windowEnd, busy))
      .map((p) => ({ start: toTime(p), end: toTime(p + durationMinutes) }));
  }

  return {
    individual: slotsFor(individualDurationMinutes),
    couple: slotsFor(coupleDurationMinutes),
  };
}
