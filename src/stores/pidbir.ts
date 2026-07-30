import { create } from "zustand";
import type {
  CriteriaValues,
  StyleAxis,
  StyleValue,
} from "@/features/pidbir/schema";

/*
  Стан візарда підбору (/pidbir): на якому кроці користувач і що вже відповів.
  Це стан інтерфейсу, не серверні дані — див. docs/RULES.md, правило 4.
  Самі психологи сюди не потрапляють: підбір рахується з mock-масиву в
  features/pidbir/api.ts у момент рендеру результатів.
*/

/** Екрани візарда по порядку. Крок «criteria» додається, лише якщо його відкрили. */
export const PIDBIR_STEPS = [
  "service",
  "topics",
  "structure",
  "lead",
  "timeFocus",
  "criteria",
  "results",
] as const;
export type PidbirStep = (typeof PIDBIR_STEPS)[number];

type PidbirAnswersState = {
  service: string | null;
  topics: string[];
  style: Partial<Record<StyleAxis, StyleValue>>;
  criteria: CriteriaValues;
};

const EMPTY_ANSWERS: PidbirAnswersState = {
  service: null,
  topics: [],
  style: {},
  criteria: { gender: null, priceMaxMinor: null },
};

type PidbirStore = PidbirAnswersState & {
  step: PidbirStep;
  /** Крок уточнення показуємо тільки на явний запит — за замовчуванням пропускається. */
  withCriteria: boolean;
  setService: (service: string) => void;
  setTopics: (topics: string[]) => void;
  setStyleAnswer: (axis: StyleAxis, value: StyleValue) => void;
  setCriteria: (criteria: CriteriaValues) => void;
  goTo: (step: PidbirStep) => void;
  openCriteria: () => void;
  reset: () => void;
};

export const usePidbirStore = create<PidbirStore>((set) => ({
  ...EMPTY_ANSWERS,
  step: "service",
  withCriteria: false,

  setService: (service) => set({ service }),
  setTopics: (topics) => set({ topics }),
  setStyleAnswer: (axis, value) =>
    set((s) => ({ style: { ...s.style, [axis]: value } })),
  setCriteria: (criteria) => set({ criteria }),

  goTo: (step) => set({ step }),
  openCriteria: () => set({ withCriteria: true, step: "criteria" }),

  reset: () => set({ ...EMPTY_ANSWERS, step: "service", withCriteria: false }),
}));

/** Порядок екранів для прогрес-бару: без «results» і без пропущеного «criteria». */
export function visibleSteps(withCriteria: boolean): PidbirStep[] {
  return PIDBIR_STEPS.filter(
    (s) => s !== "results" && (withCriteria || s !== "criteria")
  );
}
