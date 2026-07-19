import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(1, "Введіть пароль"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Введіть ім'я та прізвище"),
  email: z.string().email("Невірний формат email"),
  password: z.string().min(6, "Мінімум 6 символів"),
  consent: z.boolean().refine((v) => v, {
    message: "Потрібна згода на обробку даних",
  }),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const therapistRegisterSchema = registerSchema.extend({
  acceptVerification: z.boolean().refine((v) => v, {
    message: "Підтвердіть готовність пройти верифікацію",
  }),
});
export type TherapistRegisterValues = z.infer<typeof therapistRegisterSchema>;
