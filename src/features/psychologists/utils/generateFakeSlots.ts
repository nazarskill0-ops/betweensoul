/*
  Спільний генератор фейкових слотів бронювання — використовується і в
  SlotPicker (сітка на тиждень), і в PsychologistSidebarCard ("найближчий
  вільний час"), щоб дані не розходились між компонентами.

  // TODO(backend): реальні слоти для різних типів послуг матимуть окремі
  // записи в availability_slots з полем service_type — обговорити структуру
  // з бекенд-розробником, зараз лише UI-демонстрація на фейкових даних.
*/

export const TIME_SLOTS_POOL = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
];

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export type SlotServiceType = "individual" | "couple";
export type DaySlot = { time: string; isBooked: boolean };
export type DayColumn = { date: Date; slots: DaySlot[] };
export type SelectedSlot = { dateIso: string; time: string } | null;

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * "YYYY-MM-DD" з локальної дати — на відміну від `date.toISOString()`, не
 * зсуває день назад у часових поясах попереду UTC (наприклад Київ, UTC+2/+3).
 */
export function toLocalDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekStart(offset: number): Date {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function generateWeekSlots(
  weekStart: Date,
  serviceType: SlotServiceType = "individual"
): DayColumn[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const seed = `${toLocalDateIso(date)}-${serviceType}`;
    const rand = seededRandom(seed);
    const count = 3 + Math.floor(rand() * 3); // 3-5
    const times = shuffle(TIME_SLOTS_POOL, rand).slice(0, count).sort();
    const slots: DaySlot[] = times.map((time) => ({
      time,
      isBooked: rand() < 0.3,
    }));
    return { date, slots };
  });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startStr = weekStart.toLocaleDateString(
    "uk-UA",
    sameMonth ? { day: "numeric" } : { day: "numeric", month: "long" }
  );
  const endStr = weekEnd.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
  return `${startStr} – ${endStr}`;
}

/** Перший день з вільними слотами, починаючи з поточного тижня — для "найближчий час". */
export function findNearestFreeDay(
  serviceType: SlotServiceType = "individual",
  weeksToSearch = 4
): DayColumn | null {
  for (let w = 0; w < weeksToSearch; w++) {
    const days = generateWeekSlots(getWeekStart(w), serviceType);
    for (const day of days) {
      if (day.slots.some((s) => !s.isBooked)) return day;
    }
  }
  return null;
}

/** День (з generateWeekSlots) + "14:00" → Date на 14:00 того дня — для formatSlotRange. */
export function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(h, m, 0, 0);
  return combined;
}
