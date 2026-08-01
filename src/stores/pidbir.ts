import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
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
  користувач пішов подивитись профіль психолога (або на Google OAuth) і
  повернувся.
*/

/** Кроки, які реально перемикають вміст сторінки. */
export const PIDBIR_STEPS = ["request", "results"] as const;
export type PidbirStep = (typeof PIDBIR_STEPS)[number];

/*
  Прогрес показує три сегменти, хоча екранів два: анкета — одна сторінка, але
  візуально вона ділиться на «що болить» і «як хочеться працювати», і смуга з
  двох частин на таку довгу форму виглядала порожньо. Другий сегмент
  підсвічується скролом до блоку стилю, а не окремим переходом.
*/
export const PIDBIR_PROGRESS_STEPS = ["request", "style", "results"] as const;
export type PidbirProgressStep = (typeof PIDBIR_PROGRESS_STEPS)[number];

export const PIDBIR_PROGRESS_LABELS: Record<PidbirProgressStep, string> = {
  request: "Запит",
  style: "Стиль терапії",
  results: "Результат",
};

/** Форма запиту в процесі заповнення: стиль ще може бути неповним. */
export type RequestDraft = Omit<RequestValues, "style"> & {
  style: Partial<Record<StyleAxis, StyleValue>>;
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
  request: RequestDraft;
  /** Чи розкритий блок уточнень («Уточнити критерії» проти «Немає переваг»). */
  withCriteria: boolean;
  /**
   * Анкета заповнена, показ результату впирається лише в авторизацію.
   * Персиститься, бо Google OAuth веде користувача геть зі сторінки — після
   * повернення цей прапорець дає одразу відкрити результат, а не змушує
   * тиснути «Підібрати фахівця» вдруге.
   */
  awaitingAuth: boolean;

  goTo: (step: PidbirStep) => void;
  setService: (service: RequestValues["service"]) => void;
  toggleTopic: (topic: string) => void;
  setStyleAnswer: (axis: StyleAxis, value: StyleValue) => void;
  setWithCriteria: (withCriteria: boolean) => void;
  setGender: (gender: RequestValues["gender"]) => void;
  /** Поки не викликається: блок вікових груп прихований в анкеті (див. schema.ts). */
  setAgeGroup: (ageGroup: PsychologistAgeGroup | null) => void;
  toggleMethod: (method: RequestValues["methods"][number]) => void;
  setAwaitingAuth: (awaitingAuth: boolean) => void;
  reset: () => void;
};

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const usePidbirStore = create<PidbirStore>()(
  persist(
    (set) => ({
      step: "request",
      request: EMPTY_REQUEST,
      withCriteria: false,
      awaitingAuth: false,

      goTo: (step) => set({ step }),

      // Теми для індивідуальної та парної терапії — різні набори, тож при
      // перемиканні формату вибір скидається: інакше в запиті лишились би
      // теми, яких у поточному списку вже немає.
      setService: (service) =>
        set((s) => ({ request: { ...s.request, service, topics: [] } })),
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

      setAwaitingAuth: (awaitingAuth) => set({ awaitingAuth }),

      reset: () =>
        set({
          step: "request",
          request: EMPTY_REQUEST,
          withCriteria: false,
          awaitingAuth: false,
        }),
    }),
    {
      name: "calmi-pidbir",
      /*
        Крок не персистимо: після перезавантаження логічніше почати з анкети з
        уже заповненими даними, ніж опинитись на порожньому результаті.

        Уточнення (withCriteria + самі значення) теж навмисно не зберігаються:
        «Немає переваг» має бути станом за замовчуванням при кожному заході, а
        не липнути після одного кліку. Зберігати значення без прапорця було б
        ще гірше — блок згорнутий, а фільтр мовчки звужує видачу.
      */
      partialize: (s) => ({
        request: { ...s.request, gender: null, ageGroup: null, methods: [] },
        awaitingAuth: s.awaitingAuth,
      }),
    }
  )
);
