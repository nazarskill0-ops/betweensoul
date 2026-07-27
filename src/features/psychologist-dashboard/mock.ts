import { INDIVIDUAL_SESSION_DURATION_MINUTES } from "@/features/psychologists/utils/availabilityStore";
import type { ClientSessionHistoryEntry, PayoutSession, ProfileFormValues } from "./schema";

export const MOCK_PSYCHOLOGIST_NAME = "Олена Коваленко";

/* Мок-дати рахуються відносно поточної дати (не хардкоджені), щоб сценарії
   "історія" / "виплати цього місяця" завжди виглядали актуальними незалежно
   від того, коли відкривається сторінка під час розробки. dayOffset — зсув у
   днях від сьогодні (може бути відʼємним).
   "Найближчі сеанси" (fetchUpcomingSessions в api.ts) тут немає — вони
   рахуються з тих самих recurringBookings у availabilityStore, що й сітка
   "Перегляд", а не з окремого мок-масиву, щоб два місця не розходились. */
function relativeIso(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
}

// Минулі сесії з клієнтами — для розгорнутого списку "Історія з клієнтом" у
// вкладці "Мої сеанси" (дата, час, статус відвідування).
export const mockClientSessionHistory: ClientSessionHistoryEntry[] = [
  {
    id: "hist-1",
    startsAt: relativeIso(-40, 9),
    durationMinutes: 50,
    clientName: "Оксана Петренко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "individual",
    status: "completed",
  },
  {
    id: "hist-2",
    startsAt: relativeIso(-26, 9),
    durationMinutes: 50,
    clientName: "Оксана Петренко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "individual",
    status: "completed",
  },
  {
    id: "hist-3",
    startsAt: relativeIso(-19, 9),
    durationMinutes: 50,
    clientName: "Оксана Петренко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "individual",
    status: "cancelled",
  },
  {
    id: "hist-4",
    startsAt: relativeIso(-12, 9),
    durationMinutes: 50,
    clientName: "Оксана Петренко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "individual",
    status: "completed",
  },
  {
    id: "hist-5",
    startsAt: relativeIso(-33, 13),
    durationMinutes: 50,
    clientName: "Максим Ткаченко",
    clientAvatarUrl: null,
    type: "individual",
    status: "completed",
  },
  {
    id: "hist-6",
    startsAt: relativeIso(-19, 13),
    durationMinutes: 50,
    clientName: "Максим Ткаченко",
    clientAvatarUrl: null,
    type: "individual",
    status: "no_show",
  },
  {
    id: "hist-7",
    startsAt: relativeIso(-30, 17),
    durationMinutes: 80,
    clientName: "Дарʼя і Богдан",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=25",
    type: "couple",
    status: "completed",
  },
];

// Шаблон доступності, винятки, заблоковані слоти, налаштування парної
// терапії та повторювані бронювання живуть у спільному availabilityStore
// (features/psychologists/utils) — єдине джерело правди, яким користується і
// публічний SlotPicker. Тут лишається тільки те, що специфічне для кабінету
// психолога (профіль, дашборд-статистика, виплати).

export const mockProfile: ProfileFormValues = {
  qualification: "psychologist",
  birthDate: "1992-03-15",
  practiceStartYear: 2018,
  languages: ["uk", "en"],
  experienceText:
    "За вісім років роботи провела понад 640 сесій у когнітивно-поведінковому підході. Спеціалізуюсь на схема-терапії для тих, чиї труднощі мають глибше коріння, ніж здається на перший погляд.",
  therapyStyle:
    "Працюю структуровано: даю конкретні техніки та домашні завдання між сесіями. Вважаю, що терапія — це навички, а не одноразове полегшення.",
  avatarUrl: "https://i.pravatar.cc/300?img=47",
  aboutMe:
    "Працюю з тривожністю, самооцінкою та вигоранням. Використовую КПТ та гештальт-підхід, адаптую формат під запит клієнта.",
  educationHigher: [
    {
      title: "КНУ ім. Тараса Шевченка",
      speciality: "Клінічна психологія",
      years: "2014 – 2019",
      certificateFiles: [
        {
          url: "https://placehold.co/240x180/EDE6DB/4d5751?text=Диплом",
          name: "Диплом.jpg",
        },
      ],
    },
  ],
  educationCourses: [
    {
      title: "Курс КПТ для практикуючих психологів",
      years: "2021",
      certificateFiles: [],
    },
  ],
  educationOther: [],
  specializations: ["КПТ", "Гештальт"],
  topics: ["Тривога та панічні атаки", "Вигорання та виснаження"],
  priceMinor: 90000,
  individualSessionDurationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
  offersCoupleTherapy: true,
  couplePriceMinor: 140000,
  coupleSessionDurationMinutes: 80,
};

// TODO: verify with WayForPay transaction structure
export const mockPayoutSessions: PayoutSession[] = [
  {
    id: "po-1",
    date: relativeIso(-2, 13),
    clientName: "Оксана Петренко",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-2",
    date: relativeIso(-5, 10),
    clientName: "Максим Ткаченко",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-3",
    date: relativeIso(-10, 15),
    clientName: "Софія Романюк",
    priceMinor: 140000,
    status: "paid",
  },
  {
    id: "po-4",
    date: relativeIso(-15, 9),
    clientName: "Ігор Власенко",
    priceMinor: 90000,
    status: "pending",
  },
  {
    id: "po-5",
    date: relativeIso(-22, 11),
    clientName: "Дарʼя Коваль",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-6",
    date: relativeIso(-30, 14),
    clientName: "Богдан Сидоренко",
    priceMinor: 90000,
    status: "failed",
  },
];
