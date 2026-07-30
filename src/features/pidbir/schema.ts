import { z } from "zod";
import { SERVICES, TOPICS } from "@/features/psychologists/schema";

/*
  Анкета підбору психолога (/pidbir).
  Таксономії (теми, послуги, методи) не дублюються — беруться з
  features/psychologists/schema.ts, щоб відповіді били по тих самих значеннях,
  якими описані психологи в каталозі.
*/

/** Шкала стилю: 1..5. Значення — позиція на осі, а не порядковий номер варіанту. */
export const styleValueSchema = z.number().int().min(1).max(5);
export type StyleValue = z.infer<typeof styleValueSchema>;

/** Осі стилю терапії. Кожна — окреме питання кроку 3. */
export const STYLE_AXES = ["structure", "lead", "timeFocus"] as const;
export type StyleAxis = (typeof STYLE_AXES)[number];

export type StyleOption = {
  value: StyleValue;
  label: string;
};

export type StyleQuestion = {
  axis: StyleAxis;
  title: string;
  hint: string;
  options: StyleOption[];
};

/*
  Формулювання власні, під тон Calmi. Порядок варіантів = напрямок осі:
  1 — один полюс, 5 — протилежний. Саме ці числа порівнюються з профілями
  методів у matching.ts, тож порядок міняти не можна без правки профілів.
*/
export const STYLE_QUESTIONS: StyleQuestion[] = [
  {
    axis: "structure",
    title: "Як вам комфортніше проводити сесію?",
    hint: "Немає правильної відповіді — просто оберіть те, що ближче",
    options: [
      { value: 1, label: "За чітким планом: тема й структура на кожну зустріч" },
      { value: 2, label: "Здебільшого за планом, але з місцем для відступів" },
      { value: 3, label: "Порівну — трохи структури, трохи вільної розмови" },
      { value: 4, label: "Здебільшого вільно, структура з'являється за потреби" },
      { value: 5, label: "Повністю вільно — тема народжується під час розмови" },
    ],
  },
  {
    axis: "lead",
    title: "Якої участі ви чекаєте від терапевта?",
    hint: "Йдеться про те, скільки простору лишається вам",
    options: [
      { value: 1, label: "Уважно слухає й дає мені виговоритись" },
      { value: 2, label: "Переважно слухає, зрідка ставить запитання" },
      { value: 3, label: "Порівну слухає й ставить запитання" },
      { value: 4, label: "Часто запитує й ділиться спостереженнями" },
      { value: 5, label: "Веде розмову й дає прямий зворотний зв'язок" },
    ],
  },
  {
    axis: "timeFocus",
    title: "На чому хочеться зосередитись у роботі?",
    hint: "Терапія може йти від сьогодення вглиб — або починатися з глибини",
    options: [
      { value: 1, label: "На тому, що відбувається в житті просто зараз" },
      { value: 2, label: "Здебільшого на теперішньому, з оглядкою на минуле" },
      { value: 3, label: "Порівну на теперішньому і на його корінні" },
      { value: 4, label: "Здебільшого на тому, звідки це все тягнеться" },
      { value: 5, label: "На глибинних причинах і досвіді, що мене сформував" },
    ],
  },
];

/** Крок 1 — формат терапії. Значення = SERVICES, ними ж описані психологи. */
export const serviceStepSchema = z.object({
  service: z.enum(SERVICES, { message: "Оберіть формат терапії" }),
});
export type ServiceStepValues = z.infer<typeof serviceStepSchema>;

/** Крок 2 — теми запиту. Мінімум одна, інакше підбір не має на чому працювати. */
export const topicsStepSchema = z.object({
  topics: z
    .array(z.enum(TOPICS as [string, ...string[]]))
    .min(1, "Оберіть хоча б одну тему"),
});
export type TopicsStepValues = z.infer<typeof topicsStepSchema>;

/** Крок 3 — стиль терапії. Усі три осі обов'язкові. */
export const styleStepSchema = z.object({
  structure: styleValueSchema,
  lead: styleValueSchema,
  timeFocus: styleValueSchema,
});
export type StyleStepValues = z.infer<typeof styleStepSchema>;

/*
  Крок 4 — уточнення, за замовчуванням пропускається.
  Форма працює рядками, бо саме рядки дає радіо-група, а "" означає «не має
  значення». Схема форми навмисно не робить z.preprocess: тоді вхідний тип
  став би unknown і react-hook-form не зміг би вивести типи поля.
*/
export const criteriaFormSchema = z.object({
  gender: z.union([z.literal(""), z.enum(["female", "male"])]),
  priceMaxMinor: z.union([z.literal(""), z.string().regex(/^\d+$/)]),
});
export type CriteriaFormValues = z.infer<typeof criteriaFormSchema>;

/** Нормалізовані уточнення — те, з чим працює підбір. */
export const criteriaSchema = z.object({
  gender: z.enum(["female", "male"]).nullable(),
  priceMaxMinor: z.number().int().positive().nullable(),
});
export type CriteriaValues = z.infer<typeof criteriaSchema>;

/** "" з форми → null; рядок ціни → копійки числом. */
export function normalizeCriteria(values: CriteriaFormValues): CriteriaValues {
  return {
    gender: values.gender === "" ? null : values.gender,
    priceMaxMinor: values.priceMaxMinor === "" ? null : Number(values.priceMaxMinor),
  };
}

/** Зворотний бік: збережені відповіді → значення полів форми. */
export function criteriaToFormValues(values: CriteriaValues): CriteriaFormValues {
  return {
    gender: values.gender ?? "",
    priceMaxMinor: values.priceMaxMinor === null ? "" : String(values.priceMaxMinor),
  };
}

/** Повний набір відповідей — те, що йде в matching.ts. */
export const pidbirAnswersSchema = serviceStepSchema
  .extend(topicsStepSchema.shape)
  .extend({ style: styleStepSchema })
  .extend(criteriaSchema.shape);
export type PidbirAnswers = z.infer<typeof pidbirAnswersSchema>;

/*
  Пороги цін підібрані під реальний розкид у каталозі (650–1500 грн за
  індивідуальну сесію), щоб кожен варіант справді щось відсікав, а не був
  порожнім фільтром. Значення — копійки (docs/RULES.md, правило 7).
*/
export const PRICE_OPTIONS = [
  { value: 80000, label: "До 800 ₴" },
  { value: 100000, label: "До 1 000 ₴" },
  { value: 130000, label: "До 1 300 ₴" },
] as const;

/** Скільки психологів показуємо в результаті. */
export const MIN_RESULTS = 3;
export const MAX_RESULTS = 5;
