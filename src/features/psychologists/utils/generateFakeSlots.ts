/*
  Спільний генератор фейкових слотів бронювання — використовується і в
  SlotPicker (сітка на тиждень), і в PsychologistSidebarCard ("найближчий
  вільний час"), щоб дані не розходились між компонентами.

  Якщо переданий psychologistId має реальний шаблон доступності в
  availabilityStore (зараз лише кабінет психолога для TEMPLATED_PSYCHOLOGIST_ID),
  слоти будуються з нього (з урахуванням винятків і заблокованих слотів), а не
  з випадкового генератора нижче.

  // TODO(backend): реальні слоти для різних типів послуг матимуть окремі
  // записи в availability_slots з полем service_type — обговорити структуру
  // з бекенд-розробником, зараз лише UI-демонстрація на фейкових даних.
*/

import {
  enumerateCycleTimes,
  getCoupleSettings,
  getTemplate,
  isDateExcepted,
  isSlotOverlapping,
  weekdayOfDate,
  INDIVIDUAL_SESSION_DURATION_MINUTES,
  SESSION_BREAK_MINUTES,
} from "./availabilityStore";

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

/**
 * Слоти на день з реального шаблону доступності — null, якщо в психолога
 * його немає (тоді generateWeekSlots падає назад на випадковий генератор).
 *
 * Індивідуальні й парні слоти рахуються окремими циклами (сесія + перерва),
 * а фінальний список виключає слоти, що перетинаються в часі з уже існуючим
 * бронюванням будь-якого типу — психолог не може вести дві сесії одночасно.
 */
function generateTemplatedDaySlots(
  date: Date,
  psychologistId: string,
  serviceType: SlotServiceType
): DaySlot[] | null {
  const template = getTemplate(psychologistId);
  if (!template) return null;

  const dateIso = toLocalDateIso(date);
  if (isDateExcepted(psychologistId, dateIso)) return [];

  const weekday = weekdayOfDate(date);
  if (!template.workingDays.includes(weekday)) return [];

  let sessionDurationMinutes: number;
  if (serviceType === "couple") {
    const coupleSettings = getCoupleSettings(psychologistId);
    if (!coupleSettings?.offersCoupleTherapy) return [];
    sessionDurationMinutes = coupleSettings.coupleSessionDurationMinutes;
  } else {
    sessionDurationMinutes = INDIVIDUAL_SESSION_DURATION_MINUTES;
  }
  const cycleMinutes = sessionDurationMinutes + SESSION_BREAK_MINUTES;

  return enumerateCycleTimes(template, cycleMinutes)
    .filter(
      (time) => !isSlotOverlapping(psychologistId, dateIso, weekday, time, sessionDurationMinutes)
    )
    .map((time) => ({ time, isBooked: false }));
}

export function generateWeekSlots(
  weekStart: Date,
  serviceType: SlotServiceType = "individual",
  psychologistId?: string
): DayColumn[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);

    if (psychologistId) {
      const templated = generateTemplatedDaySlots(date, psychologistId, serviceType);
      if (templated !== null) return { date, slots: templated };
    }

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

export type UpcomingSlot = { date: Date; time: string };

/**
 * Плаский хронологічний список ще не заброньованих слотів на кілька тижнів
 * вперед — для простого списку "найближчі доступні сесії" (без week-view).
 */
export function generateUpcomingSlots(
  serviceType: SlotServiceType = "individual",
  psychologistId?: string,
  weeksToSearch = 8
): UpcomingSlot[] {
  const now = Date.now();
  const result: UpcomingSlot[] = [];

  for (let w = 0; w < weeksToSearch; w++) {
    const days = generateWeekSlots(getWeekStart(w), serviceType, psychologistId);
    for (const day of days) {
      for (const slot of day.slots) {
        if (slot.isBooked) continue;
        if (combineDateAndTime(day.date, slot.time).getTime() < now) continue;
        result.push({ date: day.date, time: slot.time });
      }
    }
  }

  return result.sort(
    (a, b) =>
      combineDateAndTime(a.date, a.time).getTime() -
      combineDateAndTime(b.date, b.time).getTime()
  );
}

/**
 * Найближчий день з вільними слотами — для "найближчий час" у сайдбарі.
 * Побудований на тому самому `generateUpcomingSlots`, що й SlotPicker, тож
 * дата тут завжди збігається з першим слотом у списку бронювання (раніше
 * ця функція сканувала тижні окремо й не відкидала слоти, що вже минули).
 */
export function findNearestFreeDay(
  serviceType: SlotServiceType = "individual",
  psychologistId?: string
): DayColumn | null {
  const upcoming = generateUpcomingSlots(serviceType, psychologistId);
  if (upcoming.length === 0) return null;

  const nearestDateIso = toLocalDateIso(upcoming[0].date);
  const slots: DaySlot[] = upcoming
    .filter((slot) => toLocalDateIso(slot.date) === nearestDateIso)
    .map((slot) => ({ time: slot.time, isBooked: false }));

  return { date: upcoming[0].date, slots };
}

/** День (з generateWeekSlots) + "14:00" → Date на 14:00 того дня — для formatSlotRange. */
export function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(h, m, 0, 0);
  return combined;
}
