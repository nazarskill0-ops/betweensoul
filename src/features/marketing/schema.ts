import { z } from "zod";

/*
  Заявка від психолога, що хоче приєднатися до Calmi. Це лід-форма (без
  пароля) — окремо від features/auth/therapistRegisterSchema, який створює
  акаунт. Дані поки що йдуть у мок, див. api.ts.
*/

export const partnerApplicationSchema = z.object({
  lastName: z.string().min(2, "Введіть прізвище"),
  firstName: z.string().min(2, "Введіть ім'я"),
  middleName: z.string().optional(),
  birthDate: z.string().min(1, "Вкажіть дату народження"),
  gender: z.enum(["female", "male"]).optional(),
  phone: z.string().min(6, "Введіть номер телефону"),
  email: z.string().email("Невірний формат email"),
  experienceSummary: z
    .string()
    .min(10, "Розкажіть трохи більше про освіту й досвід"),
  consent: z.boolean().refine((v) => v, {
    message: "Потрібна згода на обробку даних",
  }),
});
export type PartnerApplicationValues = z.infer<typeof partnerApplicationSchema>;
