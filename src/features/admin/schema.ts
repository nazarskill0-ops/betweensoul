import { z } from "zod";
import { PSYCHOLOGIST_STATUSES } from "@/features/psychologists/schema";

/** Рядок таблиці /admin/psychologists — вибірка полів психолога для швидкої оцінки. */
export const adminPsychologistRowSchema = z.object({
  profileId: z.string(),
  fullName: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(), // ISO, дата реєстрації
  status: z.enum(["pending", "approved", "rejected"]),
  qualification: z.enum(["psychologist", "psychotherapist"]),
  specializations: z.array(z.string()),
  profileComplete: z.boolean(), // чи заповнені ключові поля профілю
});
export type AdminPsychologistRow = z.infer<typeof adminPsychologistRowSchema>;

/** Фільтр за статусом — живе в URL (?status=pending), як і фільтри каталогу. */
export const ADMIN_STATUS_FILTERS = [
  { value: "all", label: "Усі" },
  ...PSYCHOLOGIST_STATUSES,
] as const;
export const adminStatusFilterSchema = z
  .enum(["all", "pending", "approved", "rejected"])
  .catch("all");
export type AdminStatusFilter = z.infer<typeof adminStatusFilterSchema>;
