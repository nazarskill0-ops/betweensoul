import { z } from "zod";
import { SERVICES, SPECIALIZATIONS, TOPICS } from "@/features/psychologists/schema";

/*
  Анкета підбору психолога (/pidbir): Запит → Результат.
  Таксономії (теми, методи, послуги) не дублюються — беруться з
  features/psychologists/schema.ts, щоб відповіді били по тих самих значеннях,
  якими описані психологи в каталозі.
*/

/* ─────────────────────────────── Крок 1: запит ─────────────────────────────── */

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

/*
  Теми для парної терапії — власний список: у запиті пари йдеться не про стан
  однієї людини, а про те, що відбувається між двома.

  `match` — значення з таксономії психологів, за яким рахується збіг. Там, де
  прямого відповідника немає (null), тема впливає лише на вибір формату, але
  не на скор: у профілях психологів таких тем поки просто немає.
  TODO(backend): коли профілі отримають парні теми, замінити null на реальні
  значення — решта логіки підбору вже готова.
*/
type CoupleTopic = { label: string; match: string | null };
type CoupleTopicGroup = { group: string; topics: CoupleTopic[] };

export const COUPLE_TOPIC_GROUPS: CoupleTopicGroup[] = [
  {
    group: "Комунікація та взаємодія",
    topics: [
      { label: "Конфлікти та непорозуміння", match: "З партнером" },
      { label: "Проблеми з комунікацією", match: null },
      { label: "Побудова особистих меж у парі", match: null },
      { label: "Емоційна дистанція", match: null },
    ],
  },
  {
    group: "Кризи та зміни",
    topics: [
      { label: "Довіра та зрада", match: null },
      { label: "Розлучення або розставання", match: "Розлучення чи розрив стосунків" },
      { label: "Співзалежність", match: "Співзалежність" },
      { label: "Сексуальні стосунки", match: null },
      { label: "Народження дитини / спільне батьківство", match: "Вагітність та материнство" },
      { label: "Адаптація до нового етапу стосунків", match: null },
    ],
  },
];

const COUPLE_TOPIC_MATCH = new Map(
  COUPLE_TOPIC_GROUPS.flatMap((g) => g.topics).map((t) => [t.label, t.match])
);

/** Усі теми, які взагалі можуть опинитись у відповідях: індивідуальні + парні. */
export const ALL_PIDBIR_TOPICS = [
  ...TOPICS,
  ...COUPLE_TOPIC_GROUPS.flatMap((g) => g.topics.map((t) => t.label)),
];

/**
 * Тема анкети → значення таксономії психологів, або null, якщо відповідника
 * немає. Індивідуальні теми збігаються з таксономією один в один.
 */
export function resolveTopicForMatching(topic: string): string | null {
  if (COUPLE_TOPIC_MATCH.has(topic)) return COUPLE_TOPIC_MATCH.get(topic) ?? null;
  return topic;
}

export const requestSchema = z.object({
  service: z.enum(SERVICES),
  topics: z
    .array(z.enum(ALL_PIDBIR_TOPICS as [string, ...string[]]))
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

/** Пошта підтримки — та сама, що у футері й кабінетах. */
export const SUPPORT_EMAIL = "support@calmi.in.ua";

/** Скільки тем показувати в групі до натискання «Ще N». */
export const TOPICS_VISIBLE_LIMIT = 6;

/** Скільки психологів показуємо в результаті. */
export const MAX_RESULTS = 5;
