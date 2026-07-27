import { z } from "zod";
import { QUALIFICATIONS } from "@/features/psychologists/schema";
import type { Weekday } from "@/features/psychologists/utils/availabilityStore";

/*
  Кабінет психолога. Дані поки що мокові — див. mock.ts / api.ts.
  Профіль тут навмисно самодостатній: читаємо спільні таксономії
  (SPECIALIZATIONS, TOPICS) та тип Weekday з features/psychologists, але не
  пишемо туди напряму — крім спільного availabilityStore (єдине джерело
  правди для шаблону доступності, яким користується і публічний SlotPicker).
*/

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "mon", label: "Пн" },
  { value: "tue", label: "Вт" },
  { value: "wed", label: "Ср" },
  { value: "thu", label: "Чт" },
  { value: "fri", label: "Пт" },
  { value: "sat", label: "Сб" },
  { value: "sun", label: "Нд" },
];
export const WEEKDAY_VALUES = WEEKDAYS.map((d) => d.value) as [Weekday, ...Weekday[]];
export type { Weekday };

export const SESSION_TYPES = ["individual", "couple"] as const;
export const SESSION_TYPE_LABELS: Record<(typeof SESSION_TYPES)[number], string> = {
  individual: "Індивідуальна",
  couple: "Парна",
};

type Qualification = (typeof QUALIFICATIONS)[number]["value"];
export const QUALIFICATION_VALUES = QUALIFICATIONS.map((q) => q.value) as [
  Qualification,
  ...Qualification[],
];

export const dashboardStatsSchema = z.object({
  monthlyRevenueMinor: z.number().int().nonnegative(),
  monthlySessionsCount: z.number().int().nonnegative(),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const upcomingSessionSchema = z.object({
  id: z.string(),
  startsAt: z.string(), // ISO, UTC
  durationMinutes: z.number().int().positive(),
  clientName: z.string(),
  clientAvatarUrl: z.string().nullable(),
  type: z.enum(SESSION_TYPES),
});
export type UpcomingSession = z.infer<typeof upcomingSessionSchema>;

export const SESSION_HISTORY_STATUSES = ["completed", "cancelled", "no_show"] as const;
export const SESSION_HISTORY_STATUS_LABELS: Record<
  (typeof SESSION_HISTORY_STATUSES)[number],
  string
> = {
  completed: "Успішно",
  cancelled: "Скасовано",
  no_show: "Неявка",
};

/** Минула сесія з клієнтом — для розгорнутого списку "Історія з клієнтом". */
export const clientSessionHistoryEntrySchema = z.object({
  id: z.string(),
  clientName: z.string(),
  clientAvatarUrl: z.string().nullable(),
  startsAt: z.string(), // ISO, UTC
  durationMinutes: z.number().int().positive(),
  type: z.enum(SESSION_TYPES),
  status: z.enum(SESSION_HISTORY_STATUSES),
});
export type ClientSessionHistoryEntry = z.infer<typeof clientSessionHistoryEntrySchema>;

/** Робоче вікно одного дня — `null` означає вихідний. */
export const dayWindowSchema = z
  .object({
    start: z.string().min(1, "Вкажіть початок"),
    end: z.string().min(1, "Вкажіть кінець"),
  })
  .refine((v) => v.start < v.end, {
    message: "Кінець має бути пізніше початку",
    path: ["end"],
  })
  .nullable();

/** Розклад по днях — кожен робочий день має власне вікно {start, end}, не спільне на всіх. */
export const weeklyAvailabilitySchema = z
  .object({
    mon: dayWindowSchema,
    tue: dayWindowSchema,
    wed: dayWindowSchema,
    thu: dayWindowSchema,
    fri: dayWindowSchema,
    sat: dayWindowSchema,
    sun: dayWindowSchema,
  })
  .refine((v) => WEEKDAY_VALUES.some((day) => v[day] !== null), {
    message: "Оберіть хоча б один робочий день",
  });
export type AvailabilityValues = z.infer<typeof weeklyAvailabilitySchema>;

export const availabilityExceptionSchema = z.object({
  id: z.string(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
  reason: z.string().nullable(),
});
export type AvailabilityException = z.infer<typeof availabilityExceptionSchema>;

/** "Дата по" не обов'язкова — порожня означає той самий день, що й "Дата з". */
export const addExceptionSchema = z
  .object({
    startDate: z.string().min(1, "Оберіть дату"),
    endDate: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "Дата «по» має бути не раніше дати «з»",
    path: ["endDate"],
  });
export type AddExceptionValues = z.infer<typeof addExceptionSchema>;

// TODO: verify field names with Illia's booking schema — тижнева сітка поки
// що на моках, реальні дані підуть із bookings + availability_slots.
export const calendarBookingSchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // "HH:MM"
  durationMinutes: z.number().int().positive(),
  clientName: z.string(),
  type: z.enum(SESSION_TYPES),
});
export type CalendarBooking = z.infer<typeof calendarBookingSchema>;

/** Завантажений файл диплома/сертифіката — превʼю в кабінеті, посилання йде в PsychologistProfile.education[].certificateUrls. */
export const certificateFileSchema = z.object({
  url: z.string(),
  name: z.string(),
});
export type CertificateFile = z.infer<typeof certificateFileSchema>;

const educationRowSchema = z.object({
  title: z.string().min(1, "Вкажіть заклад чи курс"),
  speciality: z.string().optional(),
  years: z.string().optional(),
  certificateFiles: z.array(certificateFileSchema),
});
export type EducationRowValues = z.infer<typeof educationRowSchema>;

export const profileFormSchema = z
  .object({
    // Ім'я/прізвище й відео-презентація психолог не редагує сам (не в цій
    // формі) — лишаються з базового запису, як і статус верифікації диплома,
    // кількість сесій тощо.
    qualification: z.enum(QUALIFICATION_VALUES),
    birthDate: z.string().min(1, "Вкажіть дату народження"),
    practiceStartYear: z.number().int().positive().nullable(),
    languages: z.array(z.string()).min(1, "Оберіть хоча б одну мову"),
    experienceText: z.string().min(1, "Розкажіть про досвід і компетенції"),
    therapyStyle: z.string().min(1, "Опишіть особливості вашої терапії"),
    avatarUrl: z.string().nullable(),
    aboutMe: z.string().min(1, "Розкажіть про себе"),
    educationHigher: z.array(educationRowSchema),
    educationCourses: z.array(educationRowSchema),
    educationOther: z.array(educationRowSchema),
    specializations: z.array(z.string()).min(1, "Оберіть хоча б один метод"),
    topics: z.array(z.string()).min(1, "Оберіть хоча б одну тему"),
    priceMinor: z.number().int().positive("Вкажіть ціну індивідуальної сесії"),
    // Фіксовано 50 хв для всіх — поле лишається в формі як disabled-індикатор,
    // психолог його не редагує.
    individualSessionDurationMinutes: z.number().int().positive(),
    offersCoupleTherapy: z.boolean(),
    couplePriceMinor: z.number().int().positive().nullable(),
    coupleSessionDurationMinutes: z.number().int().positive().nullable(),
  })
  .superRefine((v, ctx) => {
    if (!v.offersCoupleTherapy) return;
    if (!v.couplePriceMinor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Вкажіть ціну парної сесії",
        path: ["couplePriceMinor"],
      });
    }
    if (!v.coupleSessionDurationMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Вкажіть тривалість парної сесії",
        path: ["coupleSessionDurationMinutes"],
      });
    }
  });
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const PAYOUT_STATUSES = ["paid", "pending", "failed"] as const;
export const PAYOUT_STATUS_LABELS: Record<(typeof PAYOUT_STATUSES)[number], string> = {
  paid: "Виплачено",
  pending: "В обробці",
  failed: "Помилка",
};

// TODO: verify with WayForPay transaction structure — зараз тільки мок для UI.
export const payoutSessionSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO, UTC
  clientName: z.string(),
  priceMinor: z.number().int().nonnegative(), // ціна сесії (gross, до комісії)
  status: z.enum(PAYOUT_STATUSES),
});
export type PayoutSession = z.infer<typeof payoutSessionSchema>;
