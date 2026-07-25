/*
  Чиста функція розрахунку вільних слотів на день.

  вільні_інтервали = робоче_вікно − усі_зайняті_інтервали (підтверджені
  бронювання будь-якого типу + ручні блокування — для цієї функції вони
  нерозрізнимі, обидва просто "зайнятий час").

  У кожному вільному інтервалі індивідуальні й парні слоти генеруються
  окремими циклами (тривалість сесії + перерва), завжди від початку саме
  цього інтервалу — а не від початку робочого дня. Тому підтверджена парна
  сесія на початку дня, наприклад, зсуває весь наступний індивідуальний
  цикл, а не просто "виколює" один слот із вирівняної по дню сітки.

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

/**
 * Робоче вікно мінус усі зайняті інтервали (з мерджем перекриттів) →
 * відсортовані вільні шматки, кожен уже "обрізаний" під перерву з обох
 * боків, де вона потрібна:
 *
 * - Після КОЖНОГО зайнятого інтервалу вільний час починається не одразу з
 *   моменту його закінчення, а через `breakMinutes`.
 * - Якщо вільний шматок упирається в наступний зайнятий інтервал (а не в
 *   кінець робочого дня), його usable-кінець теж зменшується на
 *   `breakMinutes` — інакше останній слот у шматку міг би згенеруватись
 *   впритул до наступного бронювання, лишивши собі нуль перерви ПЕРЕД ним.
 *   Кінець робочого дня перервою не обрізається — там нема наступної сесії,
 *   з якою треба берегти дистанцію (див. generateSlotsInFreeInterval).
 *
 * Тобто контрольна точка (можливий початок слота) валідна, лише якщо
 * [точка, точка + тривалість + breakMinutes) не перетинається з жодним
 * зайнятим інтервалом — за винятком випадку, коли ця перерва просто виходить
 * за межі робочого дня, а не в реальне бронювання.
 */
export function subtractBusyIntervals(
  workingWindow: TimeInterval,
  busyIntervals: TimeInterval[],
  breakMinutes: number
): TimeInterval[] {
  const windowStart = toMinutes(workingWindow.start);
  const windowEnd = toMinutes(workingWindow.end);
  if (windowEnd <= windowStart) return [];

  const clipped = busyIntervals
    .map((b) => ({
      start: Math.max(toMinutes(b.start), windowStart),
      end: Math.min(toMinutes(b.end), windowEnd),
    }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const b of clipped) {
    const last = merged[merged.length - 1];
    if (last && b.start <= last.end) {
      last.end = Math.max(last.end, b.end);
    } else {
      merged.push({ ...b });
    }
  }

  const free: TimeInterval[] = [];
  let cursor = windowStart;
  for (const b of merged) {
    // usable-кінець цього вільного шматка — на breakMinutes раніше за старт
    // наступного бронювання, щоб слот, згенерований аж до цієї межі, лишав
    // собі повну перерву перед ним.
    const usableEnd = b.start - breakMinutes;
    if (usableEnd > cursor) free.push({ start: toTime(cursor), end: toTime(usableEnd) });
    // +breakMinutes після зайнятого інтервалу, не просто b.end. Якщо наступний
    // зайнятий інтервал починається раніше, ніж закінчується ця перерва, він
    // просто поглинається без окремого (закоротко) вільного шматка між ними.
    cursor = Math.max(cursor, b.end + breakMinutes);
  }
  // Останній шматок упирається в кінець робочого дня, не в бронювання —
  // перерва тут не потрібна, беремо windowEnd як є.
  if (cursor < windowEnd) free.push({ start: toTime(cursor), end: toTime(windowEnd) });

  return free;
}

/**
 * Слоти фіксованої тривалості всередині ОДНОГО вільного інтервалу — цикл
 * durationMinutes+breakMinutes, завжди від початку цього інтервалу. Слот, що
 * не вміщується цілком (лишається менше за durationMinutes до кінця
 * інтервалу), не генерується — навіть якщо для "хвоста" перерви теж не
 * вистачає, це не заважає останньому повному слоту сесії.
 */
export function generateSlotsInFreeInterval(
  interval: TimeInterval,
  durationMinutes: number,
  breakMinutes: number
): TimeInterval[] {
  if (durationMinutes <= 0) return [];

  const slots: TimeInterval[] = [];
  const end = toMinutes(interval.end);
  let cursor = toMinutes(interval.start);

  while (cursor + durationMinutes <= end) {
    slots.push({ start: toTime(cursor), end: toTime(cursor + durationMinutes) });
    cursor += durationMinutes + breakMinutes;
  }

  return slots;
}

export type AvailableSlots = {
  individual: TimeInterval[];
  couple: TimeInterval[];
};

/**
 * Робоче вікно дня + всі зайняті інтервали → вільні слоти окремо для
 * індивідуальних і парних сесій. `coupleDurationMinutes: null`, якщо
 * психолог не проводить парні сесії — тоді `couple` завжди порожній.
 */
export function calculateAvailableSlots(params: {
  workingWindow: TimeInterval | null;
  busyIntervals: TimeInterval[];
  individualDurationMinutes: number;
  coupleDurationMinutes: number | null;
  breakMinutes: number;
}): AvailableSlots {
  const {
    workingWindow,
    busyIntervals,
    individualDurationMinutes,
    coupleDurationMinutes,
    breakMinutes,
  } = params;

  if (!workingWindow) return { individual: [], couple: [] };

  const freeIntervals = subtractBusyIntervals(workingWindow, busyIntervals, breakMinutes);

  return {
    individual: freeIntervals.flatMap((f) =>
      generateSlotsInFreeInterval(f, individualDurationMinutes, breakMinutes)
    ),
    couple:
      coupleDurationMinutes == null
        ? []
        : freeIntervals.flatMap((f) =>
            generateSlotsInFreeInterval(f, coupleDurationMinutes, breakMinutes)
          ),
  };
}
