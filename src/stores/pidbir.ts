import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ProfileValues,
  PsychologistAgeGroup,
  RequestValues,
  StyleAxis,
  StyleValue,
} from "@/features/pidbir/schema";

/*
  Стан анкети підбору (/pidbir): на якому кроці користувач і що вже відповів.
  Це стан інтерфейсу, не серверні дані — див. docs/RULES.md, правило 4.
  Самі психологи сюди не потрапляють: підбір рахується з mock-масиву в
  features/pidbir/api.ts у момент рендеру результату.

  Стан персиститься в localStorage, щоб довга форма запиту не зникала, якщо
  користувач пішов подивитись профіль психолога й повернувся.
*/

export const PIDBIR_STEPS = ["profile", "request", "results"] as const;
export type PidbirStep = (typeof PIDBIR_STEPS)[number];

export const PIDBIR_STEP_LABELS: Record<PidbirStep, string> = {
  profile: "Профіль",
  request: "Запит",
  results: "Результат",
};

/** Форма запиту в процесі заповнення: стиль ще може бути неповним. */
export type RequestDraft = Omit<RequestValues, "style"> & {
  style: Partial<Record<StyleAxis, StyleValue>>;
};

const EMPTY_PROFILE: ProfileValues = {
  email: "",
  name: "",
  age: "",
  consent: false,
};

const EMPTY_REQUEST: RequestDraft = {
  service: "Індивідуальна терапія",
  topics: [],
  style: {},
  gender: null,
  ageGroup: null,
  methods: [],
};

type PidbirStore = {
  step: PidbirStep;
  profile: ProfileValues;
  request: RequestDraft;
  /** Чи розкритий блок уточнень («Уточнити критерії» проти «Немає переваг»). */
  withCriteria: boolean;

  goTo: (step: PidbirStep) => void;
  setProfile: (profile: ProfileValues) => void;
  setService: (service: RequestValues["service"]) => void;
  toggleTopic: (topic: string) => void;
  setStyleAnswer: (axis: StyleAxis, value: StyleValue) => void;
  setWithCriteria: (withCriteria: boolean) => void;
  setGender: (gender: RequestValues["gender"]) => void;
  /** Поки не викликається: блок вікових груп прихований в анкеті (див. schema.ts). */
  setAgeGroup: (ageGroup: PsychologistAgeGroup | null) => void;
  toggleMethod: (method: RequestValues["methods"][number]) => void;
  reset: () => void;
};

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const usePidbirStore = create<PidbirStore>()(
  persist(
    (set) => ({
      step: "profile",
      profile: EMPTY_PROFILE,
      request: EMPTY_REQUEST,
      withCriteria: false,

      goTo: (step) => set({ step }),
      setProfile: (profile) => set({ profile }),

      setService: (service) =>
        set((s) => ({ request: { ...s.request, service } })),
      toggleTopic: (topic) =>
        set((s) => ({
          request: { ...s.request, topics: toggle(s.request.topics, topic) },
        })),
      setStyleAnswer: (axis, value) =>
        set((s) => ({
          request: { ...s.request, style: { ...s.request.style, [axis]: value } },
        })),

      // Згорнули уточнення — скидаємо і самі значення, інакше прихований
      // фільтр мовчки звужував би видачу.
      setWithCriteria: (withCriteria) =>
        set((s) => ({
          withCriteria,
          request: withCriteria
            ? s.request
            : { ...s.request, gender: null, ageGroup: null, methods: [] },
        })),
      setGender: (gender) => set((s) => ({ request: { ...s.request, gender } })),
      setAgeGroup: (ageGroup) => set((s) => ({ request: { ...s.request, ageGroup } })),
      toggleMethod: (method) =>
        set((s) => ({
          request: { ...s.request, methods: toggle(s.request.methods, method) },
        })),

      reset: () =>
        set({
          step: "profile",
          profile: EMPTY_PROFILE,
          request: EMPTY_REQUEST,
          withCriteria: false,
        }),
    }),
    {
      name: "calmi-pidbir",
      /*
        Крок не персистимо: після перезавантаження логічніше почати з початку
        анкети з уже заповненими даними, ніж опинитись на порожньому результаті.

        Уточнення (withCriteria + самі значення) теж навмисно не зберігаються:
        «Немає переваг» має бути станом за замовчуванням при кожному заході, а
        не липнути після одного кліку. Зберігати значення без прапорця було б
        ще гірше — блок згорнутий, а фільтр мовчки звужує видачу.
      */
      partialize: (s) => ({
        profile: s.profile,
        request: { ...s.request, gender: null, ageGroup: null, methods: [] },
      }),
    }
  )
);
