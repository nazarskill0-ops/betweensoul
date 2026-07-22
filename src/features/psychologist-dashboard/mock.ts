import { INDIVIDUAL_SESSION_DURATION_MINUTES } from "@/features/psychologists/utils/availabilityStore";
import type { PayoutSession, ProfileFormValues, UpcomingSession } from "./schema";

export const MOCK_PSYCHOLOGIST_NAME = "Олена Коваленко";

export const mockUpcomingSessions: UpcomingSession[] = [
  {
    id: "up-1",
    startsAt: "2026-07-21T09:00:00.000Z",
    durationMinutes: 50,
    clientName: "Оксана Петренко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=32",
    type: "individual",
  },
  {
    id: "up-2",
    startsAt: "2026-07-21T13:00:00.000Z",
    durationMinutes: 50,
    clientName: "Максим Ткаченко",
    clientAvatarUrl: null,
    type: "individual",
  },
  {
    id: "up-3",
    startsAt: "2026-07-21T17:00:00.000Z",
    durationMinutes: 80,
    clientName: "Дарʼя і Богдан",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=25",
    type: "couple",
  },
  {
    id: "up-4",
    startsAt: "2026-07-22T10:00:00.000Z",
    durationMinutes: 50,
    clientName: "Софія Романюк",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=45",
    type: "individual",
  },
  {
    id: "up-5",
    startsAt: "2026-07-23T11:00:00.000Z",
    durationMinutes: 50,
    clientName: "Ігор Власенко",
    clientAvatarUrl: "https://i.pravatar.cc/150?img=13",
    type: "individual",
  },
];

// Шаблон доступності, винятки, заблоковані слоти, налаштування парної
// терапії та повторювані бронювання живуть у спільному availabilityStore
// (features/psychologists/utils) — єдине джерело правди, яким користується і
// публічний SlotPicker. Тут лишається тільки те, що специфічне для кабінету
// психолога (профіль, дашборд-статистика, виплати).

export const mockProfile: ProfileFormValues = {
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
    date: "2026-07-18T13:00:00.000Z",
    clientName: "Оксана Петренко",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-2",
    date: "2026-07-15T10:00:00.000Z",
    clientName: "Максим Ткаченко",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-3",
    date: "2026-07-10T15:00:00.000Z",
    clientName: "Софія Романюк",
    priceMinor: 140000,
    status: "paid",
  },
  {
    id: "po-4",
    date: "2026-07-05T09:00:00.000Z",
    clientName: "Ігор Власенко",
    priceMinor: 90000,
    status: "pending",
  },
  {
    id: "po-5",
    date: "2026-06-28T11:00:00.000Z",
    clientName: "Дарʼя Коваль",
    priceMinor: 90000,
    status: "paid",
  },
  {
    id: "po-6",
    date: "2026-06-20T14:00:00.000Z",
    clientName: "Богдан Сидоренко",
    priceMinor: 90000,
    status: "failed",
  },
];
