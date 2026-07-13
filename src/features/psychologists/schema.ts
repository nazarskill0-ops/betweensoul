import { z } from "zod";

/*
  Taxonomies mirror rozmova.me (наш продуктовый ориентир).
  Значения хранятся в БД как строки — не переименовывать без миграции.
*/

/** Послуги. Каталог по умолчанию просит выбрать одну из первых трёх. */
export const SERVICES = [
  "Особиста терапія",
  "Парна терапія",
  "Дитяча терапія",
  "Сексологія",
  "Психіатрія",
] as const;

/** Три базовые услуги для стартового выбора в каталоге. */
export const CORE_SERVICES = SERVICES.slice(0, 3);

/** Теми запитів, сгруппированы как в мега-меню Rozmova. */
export const TOPIC_GROUPS = [
  {
    group: "Стосунки з собою",
    topics: [
      "Дратівливість",
      "Панічні атаки",
      "Самотність",
      "Спроби самогубства",
      "Депресивні стани",
      "Втома",
      "Самооцінка та самоцінність",
      "Нав'язливі думки та ритуали",
      "Хімічні залежності",
      "Ставлення до їжі",
    ],
  },
  {
    group: "Нові умови життя",
    topics: [
      "Втрата та горе",
      "Народження дитини",
      "ПТСР",
      "Кризи і травми",
      "Репродуктивне здоров'я",
      "Вагітність",
      "Літній вік",
    ],
  },
  {
    group: "Стосунки з іншими",
    topics: [
      "Сімейні стосунки",
      "Співзалежність",
      "Аб'юз, емоційне насилля",
      "Соціофобія",
    ],
  },
  {
    group: "Діяльність",
    topics: [
      "Емоційне вигорання",
      "Ставлення до грошей",
      "Прокрастинація",
      "Мотивація",
      "РДУГ",
      "Профорієнтація",
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
  "Дитяча психологія",
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
  { value: "psychiatrist", label: "Психіатр" },
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
  qualification: z.enum(["psychologist", "psychotherapist", "psychiatrist"]),
  experienceYears: z.number().int().nonnegative().nullable(),
  priceMinor: z.number().int().nonnegative(), // ціна за годину
  sessionsCount: z.number().int().nonnegative(), // проведено сесій (бейдж доверия)
  formats: z.array(z.string()), // пока всегда ['online']
  services: z.array(z.string()),
  topics: z.array(z.string()),
  specializations: z.array(z.string()),
  languages: z.array(z.string()),
  bio: z.string().optional(),
  clientCategories: z.array(z.string()).default([]),
  videoUrl: z.string().nullable().default(null),
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
  bio: z.string(),
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

/** Фильтры каталога. 1:1 с search-параметрами URL. */
export const psychologistFiltersSchema = z.object({
  q: z.string().optional(), // поиск по имени
  service: z.string().optional(),
  topics: z.array(z.string()).optional(), // ищет и в основной, и во вторичной экспертизе
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  clientCategories: z.array(z.string()).optional(),
  gender: z.string().optional(),
  qualification: z.string().optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().positive().optional(),
});
export type PsychologistFilters = z.infer<typeof psychologistFiltersSchema>;
