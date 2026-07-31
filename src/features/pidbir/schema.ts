import { z } from "zod";
import { SERVICES, SPECIALIZATIONS, TOPICS } from "@/features/psychologists/schema";

/*
  Анкета підбору психолога (/pidbir): Профіль → Запит → Результат.
  Таксономії (теми, методи, послуги) не дублюються — беруться з
  features/psychologists/schema.ts, щоб відповіді били по тих самих значеннях,
  якими описані психологи в каталозі.
*/

/* ────────────────────────────── Крок 1: профіль ───────────────────────────── */

export const profileSchema = z.object({
  email: z.string().min(1, "Вкажіть email").email("Схоже, в адресі помилка"),
  name: z.string().trim().min(1, "Вкажіть ім'я"),
  /*
    Вік необов'язковий, тож порожній рядок — валідне значення. Поле навмисно
    лишається рядком (а не z.coerce.number): коерція робить вхідний тип
    unknown, і react-hook-form перестає виводити типи форми.
  */
  age: z.string().refine(
    (v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 16 && Number(v) <= 100),
    { message: "Вік має бути числом від 16 до 100" }
  ),
  consent: z.boolean(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

/* ─────────────────────────────── Крок 2: запит ─────────────────────────────── */

/** Для кого шукають психолога. Значення = SERVICES, ними ж описані психологи. */
export const AUDIENCE_OPTIONS = [
  { value: SERVICES[0], label: "Для себе" },
  { value: SERVICES[1], label: "Для пари" },
] as const;

/**
 * Шкала стилю: 1..3. Профілі методів у matching.ts живуть на шкалі 1..5,
 * тож три відповіді розкладаються на її полюси й середину (див. STYLE_SCALE).
 */
export const styleValueSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
export type StyleValue = z.infer<typeof styleValueSchema>;

export const STYLE_AXES = ["structure", "lead", "timeFocus"] as const;
export type StyleAxis = (typeof STYLE_AXES)[number];

export type StyleQuestion = {
  axis: StyleAxis;
  title: string;
  options: { value: StyleValue; label: string }[];
};

/*
  Формулювання власні, під тон Calmi. Порядок варіантів = напрямок осі
  (1 — один полюс, 3 — протилежний), і саме ці числа порівнюються з профілями
  методів, тож переставляти їх не можна без правки matching.ts.
*/
export const STYLE_QUESTIONS: StyleQuestion[] = [
  {
    axis: "structure",
    title: "Структура сесії",
    options: [
      { value: 1, label: "Чіткий план і фокус" },
      { value: 2, label: "Баланс структури і вільної розмови" },
      { value: 3, label: "Вільний потік" },
    ],
  },
  {
    axis: "lead",
    title: "Роль терапевта",
    options: [
      { value: 1, label: "Переважно слухає" },
      { value: 2, label: "Збалансований діалог" },
      { value: 3, label: "Активно веде і дає зворотний зв'язок" },
    ],
  },
  {
    axis: "timeFocus",
    title: "Фокус у часі",
    options: [
      { value: 1, label: "Те, що відбувається зараз" },
      { value: 2, label: "Баланс минулого і теперішнього" },
      { value: 3, label: "Глибинні причини і минуле" },
    ],
  },
];

/**
 * Вікові групи психолога. Рахуються з birthDate, окремим полем не зберігаються.
 *
 * Наразі не показуються в анкеті (див. RequestStep): на десятку опублікованих
 * спеціалістів цей фільтр разом зі статтю й методом надто часто давав порожню
 * видачу. Константа й поле `ageGroup` лишаються робочими, щоб повернути блок,
 * коли психологів стане більше.
 */
export const PSYCHOLOGIST_AGE_GROUPS = [
  { value: "under30", label: "До 30", min: 0, max: 29 },
  { value: "30_40", label: "30–40", min: 30, max: 40 },
  { value: "40_50", label: "40–50", min: 41, max: 50 },
  { value: "50plus", label: "50+", min: 51, max: 200 },
] as const;
export type PsychologistAgeGroup = (typeof PSYCHOLOGIST_AGE_GROUPS)[number]["value"];

export const requestSchema = z.object({
  service: z.enum(SERVICES),
  topics: z
    .array(z.enum(TOPICS as [string, ...string[]]))
    .min(1, "Оберіть хоча б одну тему"),
  style: z.object({
    structure: styleValueSchema,
    lead: styleValueSchema,
    timeFocus: styleValueSchema,
  }),
  // Уточнення необов'язкові: null / порожній масив означає «байдуже».
  gender: z.enum(["female", "male"]).nullable(),
  ageGroup: z.enum(["under30", "30_40", "40_50", "50plus"]).nullable(),
  methods: z.array(z.enum(SPECIALIZATIONS)),
});
export type RequestValues = z.infer<typeof requestSchema>;

/** Скільки тем показувати в групі до натискання «Ще N». */
export const TOPICS_VISIBLE_LIMIT = 6;

/** Скільки психологів показуємо в результаті. */
export const MAX_RESULTS = 5;
