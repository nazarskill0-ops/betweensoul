/*
  Спільне мок-сховище доступності психолога — міст між кабінетом психолога
  (features/psychologist-dashboard) і публічним бронюванням (SlotPicker,
  generateFakeSlots.ts у цій же фічі). Реальний шаблон доступності зараз має
  лише один психолог (TEMPLATED_PSYCHOLOGIST_ID) — решта каталогу й далі
  показує випадкові фейкові слоти з generateFakeSlots.ts.
  TODO(backend): замінити на реальні запити до availability_slots.
*/

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

export type AvailabilityTemplate = {
  workingDays: Weekday[];
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

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

let template: AvailabilityTemplate = {
  workingDays: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "18:00",
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

let recurringBookings: RecurringBooking[] = [
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

export function getTemplate(psychologistId: string): AvailabilityTemplate | null {
  return psychologistId === TEMPLATED_PSYCHOLOGIST_ID ? template : null;
}

export function setTemplate(psychologistId: string, next: AvailabilityTemplate) {
  if (psychologistId !== TEMPLATED_PSYCHOLOGIST_ID) return;
  template = next;
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

/** "09:00".."18:00" крок cycleMinutes → ["09:00","10:00",...] поки вкладається до кінця. */
export function enumerateCycleTimes(
  availabilityTemplate: AvailabilityTemplate,
  cycleMinutes: number
): string[] {
  const [startH, startM] = availabilityTemplate.startTime.split(":").map(Number);
  const [endH, endM] = availabilityTemplate.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const times: string[] = [];

  for (let m = startMinutes; m + cycleMinutes <= endMinutes; m += cycleMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }

  return times;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nextH = Math.floor(total / 60) % 24;
  const nextM = total % 60;
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function rangesOverlap(
  aStart: string,
  aDurationMinutes: number,
  bStart: string,
  bDurationMinutes: number
): boolean {
  const aStartMin = toMinutes(aStart);
  const bStartMin = toMinutes(bStart);
  return aStartMin < bStartMin + bDurationMinutes && bStartMin < aStartMin + aDurationMinutes;
}

// TODO: verify overlap-blocking logic with Illia when real booking data available —
// мок-реалізація зараз: перекриття рахується проти заблокованих слотів і
// повторюваних (щотижневих) мок-бронювань, а не проти реальної таблиці bookings.
export function isSlotOverlapping(
  psychologistId: string,
  dateIso: string,
  weekday: Weekday,
  startTime: string,
  durationMinutes: number
): boolean {
  const overlapsBlocked = getBlockedSlots(psychologistId)
    .filter((b) => b.date === dateIso)
    .some((b) => rangesOverlap(startTime, durationMinutes, b.startTime, toMinutes(b.endTime) - toMinutes(b.startTime)));
  if (overlapsBlocked) return true;

  return getRecurringBookings(psychologistId)
    .filter((b) => b.dayOfWeek === weekday)
    .some((b) => rangesOverlap(startTime, durationMinutes, b.startTime, b.durationMinutes));
}
