import { z } from "zod";
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

export const availabilitySchema = z
  .object({
    workingDays: z
      .array(z.enum(WEEKDAY_VALUES))
      .min(1, "Оберіть хоча б один робочий день"),
    startTime: z.string().min(1, "Вкажіть початок"),
    endTime: z.string().min(1, "Вкажіть кінець"),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: "Кінець робочого дня має бути пізніше початку",
    path: ["endTime"],
  });
export type AvailabilityValues = z.infer<typeof availabilitySchema>;

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
  dayOfWeek: z.enum(WEEKDAY_VALUES),
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
    avatarUrl: z.string().nullable(),
    aboutMe: z.string().min(1, "Розкажіть про себе"),
    educationHigher: z.array(educationRowSchema),
    educationCourses: z.array(educationRowSchema),
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
