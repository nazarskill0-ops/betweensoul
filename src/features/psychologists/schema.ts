import { z } from "zod";

/*
  Taxonomies mirror rozmova.me (наш продуктовый ориентир).
  Значения хранятся в БД как строки — не переименовывать без миграции.
*/

/** Послуги. Значення зберігаються в URL/фільтрах/моках — не перейменовувати без міграції. */
export const SERVICES = ["Індивідуальна терапія", "Парна терапія"] as const;

/** Три базовые услуги для стартового выбора в каталоге. */
export const CORE_SERVICES = SERVICES.slice(0, 3);

/** Типізоване значення SERVICES — замість порівнянь із рядковими літералами. */
export type Service = (typeof SERVICES)[number];
/** Іменована типізована константа замість "магічного рядка" у порівняннях. */
export const COUPLE_THERAPY_SERVICE: Service = "Парна терапія";

/**
 * Значення SERVICES — це те саме, що зберігається в URL/фільтрах/моках
 * (`?service=Особиста терапія`, `p.services.includes(...)`), тож саме
 * значення не перейменовуємо без міграції. Тут лише те, що бачить клієнт.
 */
export function formatServiceLabel(service: string): string {
  return service === "Особиста терапія" ? "Індивідуальна терапія" : service;
}

/** Теми запитів, сгруппированы як в мега-меню Rozmova. */
export const TOPIC_GROUPS = [
  {
    group: "Емоційний стан",
    topics: [
      "Тривога та панічні атаки",
      "Депресивні стани",
      "Вигорання та виснаження",
      "Самооцінка та невпевненість",
      "Нав'язливі думки",
      "Розлади харчової поведінки",
      "Проблеми зі сном",
      "Хімічні залежності",
      "Спроби самогубства",
    ],
  },
  {
    group: "Стосунки",
    topics: [
      "З партнером",
      "З батьками",
      "З дітьми",
      "Самотність та ізоляція",
      "Співзалежність",
      "Аб'юз та насильство",
    ],
  },
  {
    group: "Життєві переходи",
    topics: [
      "Втрата та горе",
      "Розлучення чи розрив стосунків",
      "Вагітність та материнство",
      "Криза та травматичний досвід",
      "Хвороба — своя чи близьких",
    ],
  },
  {
    group: "Робота та самореалізація",
    topics: [
      "Вигорання на роботі",
      "Прокрастинація",
      "Втрата мотивації",
      "Пошук себе та професійне самовизначення",
    ],
  },
] as const;

/** Плоский список всех тем (для валидации и мультиселектов). */
export const TOPICS = TOPIC_GROUPS.flatMap((g) => [...g.topics]);

/** Методи терапії. */
export const SPECIALIZATIONS = [
  "КПТ",
  "Психоаналіз",
  "Гештальт",
  "EMDR",
  "Сімейна терапія",
  "НЛП",
  "Травматерапія",
  "Психодрама",
  "Символдрама",
  "Наративна психологія",
  "Позитивна психотерапія",
  "Екзистенційний аналіз",
  "Транзактний аналіз",
  "Арт-терапія",
  "Клієнт-центрована терапія",
  "Тілесно-орієнтована терапія",
  "Системна сімейна терапія",
  "ДПТ",
  "Схема-терапія",
  "Терапія прийняття і відповідальності (ACT)",
  "Інше",
] as const;

export const CLIENT_CATEGORIES = [
  { value: "general", label: "Загальна аудиторія" },
  { value: "veterans", label: "Учасники бойових дій та ветерани" },
  { value: "lgbtq", label: "ЛГБТК+ спільнота" },
  { value: "military_families", label: "Родини військових" },
  { value: "disabilities", label: "Люди з інвалідністю" },
  { value: "business", label: "Бізнес та керівники" },
  { value: "grief", label: "Втрата та горювання" },
  { value: "eating_disorders", label: "Розлади харчової поведінки (РХП)" },
  {
    value: "chronic_illness",
    label: "Тяжкі та хронічні захворювання (включно з психосоматикою)",
  },
  { value: "idp", label: "ВПО (внутрішньо переміщені особи)" },
  { value: "abuse_survivors", label: "Пережили домашнє/сексуальне насильство" },
  { value: "divorce", label: "Розлучення та вихід зі стосунків" },
  { value: "separation", label: "Сепарація від батьків" },
  { value: "adaptation", label: "Адаптація та еміграція" },
  { value: "addiction", label: "Залежність (алкогольна, наркотична, ігрова)" },
] as const;

export const LANGUAGES = [
  { value: "uk", label: "Українська" },
  { value: "ru", label: "Російська" },
  { value: "en", label: "English" },
] as const;

export const QUALIFICATIONS = [
  { value: "psychologist", label: "Психолог" },
  { value: "psychotherapist", label: "Психотерапевт" },
] as const;

export const GENDERS = [
  { value: "female", label: "Жінка" },
  { value: "male", label: "Чоловік" },
] as const;

/** Формат приёма. Пока только онлайн, но поле заложено на будущее. */
export const FORMATS = [
  { value: "online", label: "Онлайн" },
  { value: "offline", label: "Офлайн" },
] as const;

/** Психолог в списке каталога. `topics` — это «Основна експертиза». */
export const psychologistCardSchema = z.object({
  profileId: z.string(),
  fullName: z.string(),
  headline: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  gender: z.enum(["female", "male"]),
  qualification: z.enum(["psychologist", "psychotherapist"]),
  practiceStartYear: z.number().int().positive().nullable(), // досвід рахується як поточний_рік − цей рік
  priceMinor: z.number().int().nonnegative(), // ціна за годину
  sessionsCount: z.number().int().nonnegative(), // проведено сесій (бейдж доверия)
  formats: z.array(z.string()), // пока всегда ['online']
  services: z.array(z.string()),
  topics: z.array(z.string()),
  specializations: z.array(z.string()),
  languages: z.array(z.string()),
  bio: z.string().optional(),
  aboutMe: z.string(), // «Про мене» — власні слова психотерапевта
  clientCategories: z.array(z.string()).default([]),
  videoUrl: z.string().nullable().default(null),
  birthDate: z.string(), // YYYY-MM-DD; вік рахується від цієї дати, не зберігається окремим числом
  couplePriceMinor: z.number().int().nonnegative().nullable().default(null), // ціна за парну сесію
  coupleSessionDurationMinutes: z.number().int().positive().nullable().default(null),
});
export type PsychologistCard = z.infer<typeof psychologistCardSchema>;

/** Пункт образования («Вища та професійна освіта» / «Професійні курси» / «Інший досвід»). */
export const educationItemSchema = z.object({
  title: z.string(), // заведение или школа
  speciality: z.string().optional(),
  years: z.string().optional(), // "2022 – 2024"
  description: z.string().optional(),
  certificateUrls: z.array(z.string()).default([]), // фото дипломов/сертификатов
});
export type EducationItem = z.infer<typeof educationItemSchema>;

/** Отзыв клиента. */
export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  createdAt: z.string(), // ISO, UTC
  rating: z.number().int().min(1).max(5),
  topics: z.array(z.string()), // теги тем, с которыми работали
  text: z.string(),
});
export type Review = z.infer<typeof reviewSchema>;

/** Полный профиль психолога (страница /psychologist/[id]). */
export const psychologistProfileSchema = psychologistCardSchema.extend({
  experienceText: z.string(), // «Досвід і компетенції»
  therapyStyle: z.string(), // «Особливості терапії»
  topicsSecondary: z.array(z.string()), // «Я також працюю з»
  topicsExcluded: z.array(z.string()), // «З чим я не працюю»
  education: z.object({
    higher: z.array(educationItemSchema),
    courses: z.array(educationItemSchema),
    other: z.array(educationItemSchema),
  }),
  reviews: z.array(reviewSchema),
});
export type PsychologistProfile = z.infer<typeof psychologistProfileSchema>;

/** Скільки карток психологів показувати на одній сторінці каталогу. */
export const CATALOG_PAGE_SIZE = 10;

/** Фильтры каталога. 1:1 с search-параметрами URL. */
export const psychologistFiltersSchema = z.object({
  q: z.string().optional(), // поиск по имени
  // .catch(undefined) — щоб застаріле/зіпсоване ?service=... в URL (напр.
  // збережене посилання після перейменування значення) не валило весь
  // рендер каталогу винятком, а просто трактувалось як "нема фільтра".
  service: z.enum(SERVICES).optional().catch(undefined),
  topics: z.array(z.string()).optional(), // ищет и в основной, и во вторичной экспертизе
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  clientCategories: z.array(z.string()).optional(),
  gender: z.string().optional(),
  qualification: z.string().optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().catch(undefined),
});
export type PsychologistFilters = z.infer<typeof psychologistFiltersSchema>;
