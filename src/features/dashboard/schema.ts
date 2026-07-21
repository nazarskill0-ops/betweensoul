import { z } from "zod";

/*
  Клієнтський кабінет. Дані поки що мокові — див. mock.ts / api.ts.
*/

export const clientUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});
export type ClientUser = z.infer<typeof clientUserSchema>;

export const SESSION_TYPES = ["individual", "couple"] as const;
export const SESSION_TYPE_LABELS: Record<(typeof SESSION_TYPES)[number], string> = {
  individual: "Індивідуальна",
  couple: "Парна",
};
export const SESSION_STATUSES = [
  "confirmed",
  "pending_payment",
  "completed",
  "cancelled",
] as const;

// TODO: verify field names with Illia's booking schema — структура ще не
// фінально узгоджена з бекендом, зараз тільки мок для UI.
export const clientSessionSchema = z.object({
  id: z.string(),
  psychologistId: z.string(),
  psychologistName: z.string(),
  psychologistAvatarUrl: z.string().nullable(),
  startsAt: z.string(), // ISO, UTC
  durationMinutes: z.number().int().positive(),
  type: z.enum(SESSION_TYPES),
  priceMinor: z.number().int().nonnegative(),
  status: z.enum(SESSION_STATUSES),
});
export type ClientSession = z.infer<typeof clientSessionSchema>;

export const editProfileSchema = z.object({
  fullName: z.string().min(2, "Введіть ім'я та прізвище"),
  email: z.string().email("Невірний формат email"),
  phone: z.string().min(6, "Введіть номер телефону"),
});
export type EditProfileValues = z.infer<typeof editProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введіть поточний пароль"),
    newPassword: z.string().min(6, "Мінімум 6 символів"),
    confirmPassword: z.string().min(1, "Повторіть новий пароль"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  newEmail: z.string().email("Невірний формат email"),
  password: z.string().min(1, "Введіть пароль для підтвердження"),
});
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export const notificationSettingsSchema = z.object({
  emailReminders: z.boolean(),
  smsReminders: z.boolean(),
  marketingEmails: z.boolean(),
});
export type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
