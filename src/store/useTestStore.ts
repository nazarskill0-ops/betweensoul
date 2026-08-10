import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TestStore } from "@/lib/types";

const emptyPartner = { name: "", birthday: "", gender: "" } as const;

export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      partner1: { ...emptyPartner },
      partner2: { ...emptyPartner },
      relationshipStart: "",
      email: "",
      answers: {},
      reportId: null,
      teaser: null,
      setPartner1: (data) =>
        set((state) => ({ partner1: { ...state.partner1, ...data } })),
      setPartner2: (data) =>
        set((state) => ({ partner2: { ...state.partner2, ...data } })),
      setRelationshipStart: (date) => set({ relationshipStart: date }),
      setEmail: (email) => set({ email }),
      setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
      setReport: (reportId, teaser) => set({ reportId, teaser }),
      resetTest: () =>
        set({
          partner1: { ...emptyPartner },
          partner2: { ...emptyPartner },
          relationshipStart: "",
          email: "",
          answers: {},
          reportId: null,
          teaser: null,
        }),
    }),
    {
      name: "couplescan-test",
      /**
       * Bump this whenever the persisted shape changes — `answers` keys or the
       * `teaser` fields.
       *
       * Without it, a returning visitor rehydrates a report written by an older
       * build and the page reads a field that no longer exists on it, which
       * throws during render rather than degrading. There is nothing here worth
       * migrating (a half-finished test, at most), so a version mismatch drops
       * the state and starts clean.
       */
      version: 3,
      migrate: () => undefined,
      // The full report never touches the client until it's paid for, so the
      // only thing worth persisting is enough to survive a refresh mid-test.
      partialize: (state) => ({
        partner1: state.partner1,
        partner2: state.partner2,
        relationshipStart: state.relationshipStart,
        email: state.email,
        answers: state.answers,
        reportId: state.reportId,
        teaser: state.teaser,
      }),
    },
  ),
);
