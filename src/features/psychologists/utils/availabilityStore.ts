/*
  Спільне мок-сховище доступності психолога — міст між кабінетом психолога
  (features/psychologist-dashboard) і публічним бронюванням (SlotPicker,
  generateFakeSlots.ts у цій же фічі). Реальний шаблон доступності зараз має
  лише один психолог (TEMPLATED_PSYCHOLOGIST_ID) — решта каталогу й далі
  показує випадкові фейкові слоти з generateFakeSlots.ts.
  TODO(backend): замінити на реальні запити до availability_slots.
*/

import type { TimeInterval } from "./calculateAvailableSlots";

export const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAY_ORDER)[number];

const JS_DAY_TO_WEEKDAY: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function weekdayOfDate(date: Date): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getDay()];
}

export type SessionType = "individual" | "couple";

/** Індивідуальна сесія — фіксовано 50 хв для всіх психологів, не редагується. */
export const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;
/** Перерва між сесіями — фіксовано 10 хв для всіх, для обох типів сесій. */
export const SESSION_BREAK_MINUTES = 10;

/** Робоче вікно свого власного дня — `null` означає вихідний. */
export type WeeklyAvailability = Record<Weekday, TimeInterval | null>;

export type AvailabilityExceptionRange = {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string | null;
};

export type BlockedSlot = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

/** Тривалість парної сесії — своя для кожного психолога (з профілю). */
export type CoupleSettings = {
  offersCoupleTherapy: boolean;
  coupleSessionDurationMinutes: number;
};

// TODO: verify field names with Illia's booking schema — тижнева сітка поки
// що на моках, реальні дані підуть із bookings + availability_slots.
export type RecurringBooking = {
  id: string;
  dayOfWeek: Weekday;
  startTime: string; // "HH:MM"
  durationMinutes: number;
  clientName: string;
  type: SessionType;
};

/** Психолог, для якого кабінет психолога керує реальним шаблоном доступності. */
export const TEMPLATED_PSYCHOLOGIST_ID = "p-01";

let weeklyAvailability: WeeklyAvailability = {
  mon: { start: "09:00", end: "18:00" },
  tue: { start: "09:00", end: "18:00" },
  wed: { start: "09:00", end: "18:00" },
  thu: { start: "09:00", end: "18:00" },
  fri: { start: "09:00", end: "18:00" },
  sat: null,
  sun: null,
};

let exceptions: AvailabilityExceptionRange[] = [
  { id: "exc-1", startDate: "2026-07-30", endDate: "2026-07-30", reason: "Лікарняний" },
  { id: "exc-2", startDate: "2026-08-15", endDate: "2026-08-25", reason: "Відпустка" },
];

let blockedSlots: BlockedSlot[] = [];

// Взято "із заявки психолога при реєстрації" — п-01 (Олена Коваленко) дійсно
// пропонує парну терапію в каталозі (couplePriceMinor заповнений), тож тут не
// довільний дефолт, а те саме значення. Не хардкодити true для всіх — інші
// психологи каталогу цього поля просто не мають (getCoupleSettings → null).
let coupleSettings: CoupleSettings = {
  offersCoupleTherapy: true,
  coupleSessionDurationMinutes: 80,
};

const recurringBookings: RecurringBooking[] = [
  {
    id: "cb-1",
    dayOfWeek: "mon",
    startTime: "10:00",
    durationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
    clientName: "Оксана П.",
    type: "individual",
  },
  {
    id: "cb-2",
    dayOfWeek: "mon",
    startTime: "14:00",
    durationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
    clientName: "Максим Т.",
    type: "individual",
  },
  {
    id: "cb-3",
    dayOfWeek: "wed",
    startTime: "11:00",
    durationMinutes: 80,
    clientName: "Дарʼя і Богдан",
    type: "couple",
  },
  {
    id: "cb-4",
    dayOfWeek: "thu",
    startTime: "16:00",
    durationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
    clientName: "Софія Р.",
    type: "individual",
  },
  {
    id: "cb-5",
    dayOfWeek: "fri",
    startTime: "09:00",
    durationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
    clientName: "Ігор В.",
    type: "individual",
  },
];

export function getWeeklyAvailability(psychologistId: string): WeeklyAvailability | null {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? weeklyAvailability : null;
}

export function setWeeklyAvailability(psychologistId: string, next: WeeklyAvailability) {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return;
  weeklyAvailability = next;
}

export function getExceptions(psychologistId: string): AvailabilityExceptionRange[] {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? exceptions : [];
}

export function addExceptionRange(
  psychologistId: string,
  range: { startDate: string; endDate: string; reason: string | null }
): AvailabilityExceptionRange[] {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return [];
  exceptions = [...exceptions, { id: `exc-${Date.now()}`, ...range }].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
  return exceptions;
}

export function removeExceptionRange(
  psychologistId: string,
  exceptionId: string
): AvailabilityExceptionRange[] {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return exceptions;
  exceptions = exceptions.filter((e) => e.id !== exceptionId);
  return exceptions;
}

export function isDateExcepted(psychologistId: string, dateIso: string): boolean {
  return getExceptions(psychologistId).some((e) => dateIso >= e.startDate && dateIso <= e.endDate);
}

export function getBlockedSlots(psychologistId: string): BlockedSlot[] {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? blockedSlots : [];
}

export function toggleBlockedSlot(
  psychologistId: string,
  date: string,
  startTime: string,
  endTime: string
): BlockedSlot[] {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return [];
  const existing = blockedSlots.find((b) => b.date === date && b.startTime === startTime);
  blockedSlots = existing
    ? blockedSlots.filter((b) => b !== existing)
    : [...blockedSlots, { id: `blk-${Date.now()}`, date, startTime, endTime }];
  return blockedSlots;
}

export function getCoupleSettings(psychologistId: string): CoupleSettings | null {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? coupleSettings : null;
}

export function setCoupleSettings(psychologistId: string, next: CoupleSettings) {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return;
  coupleSettings = next;
}

export function getRecurringBookings(psychologistId: string): RecurringBooking[] {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? recurringBookings : [];
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nextH = Math.floor(total / 60) % 24;
  const nextM = total % 60;
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
}

/**
 * Усі зайняті інтервали дня (підтверджені бронювання будь-якого типу + ручні
 * блокування) — вхід для `calculateAvailableSlots`. Бронювання незмінні,
 * тут лише конвертуються в `{start, end}`; блокування вже зберігаються так.
 */
export function getBusyIntervals(
  psychologistId: string,
  dateIso: string,
  weekday: Weekday
): TimeInterval[] {
  const busyFromBookings = getRecurringBookings(psychologistId)
    .filter((b) => b.dayOfWeek === weekday)
    .map((b) => ({ start: b.startTime, end: addMinutesToTime(b.startTime, b.durationMinutes) }));

  const busyFromBlocks = getBlockedSlots(psychologistId)
    .filter((b) => b.date === dateIso)
    .map((b) => ({ start: b.startTime, end: b.endTime }));

  return [...busyFromBookings, ...busyFromBlocks];
}
