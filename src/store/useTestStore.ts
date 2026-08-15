import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { PartnerAnswers, TestStore } from "@/lib/types";

const emptyPartner = { name: "", birthday: "", gender: "" } as const;
const emptyDraft: PartnerAnswers = { p1: "", p2: "" };

/**
 * One per run of the test. See `TestStore.submissionId` for why it exists.
 *
 * `randomUUID` needs a secure context, which every browser this runs in has —
 * but a stray http:// origin would throw during store creation and take the
 * whole app down, so it falls back rather than gambling on that.
 */
function newSubmissionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

/**
 * Everything the reader has typed so far, saved for the length of one sitting.
 *
 * sessionStorage rather than localStorage: this exists so a refresh, a stray
 * Back, or a phone killing the tab mid-quiz doesn't throw away fifteen answered
 * questions. It is not meant to greet someone a week later with a half-finished
 * test they've forgotten taking — and a shared device shouldn't hand the next
 * person a couple's answers. Closing the tab is the end of it.
 */
export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      partner1: { ...emptyPartner },
      partner2: { ...emptyPartner },
      relationshipStart: "",
      submissionId: newSubmissionId(),
      answers: {},
      questionIndex: 0,
      drafts: {},
      reportId: null,
      teaser: null,
      setPartner1: (data) =>
        set((state) => ({ partner1: { ...state.partner1, ...data } })),
      setPartner2: (data) =>
        set((state) => ({ partner2: { ...state.partner2, ...data } })),
      setRelationshipStart: (date) => set({ relationshipStart: date }),
      setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
      setQuestionIndex: (index) => set({ questionIndex: index }),
      // Takes an updater rather than a patch: a multi-select toggle has to read
      // the value it is toggling, and two taps in the same tick would otherwise
      // both start from the same stale string and one would be dropped.
      updateDraft: (key, update) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: update(state.drafts[key] ?? emptyDraft),
          },
        })),
      setReport: (reportId, teaser) => set({ reportId, teaser }),
      resetTest: () =>
        set({
          partner1: { ...emptyPartner },
          partner2: { ...emptyPartner },
          relationshipStart: "",
          submissionId: newSubmissionId(),
          answers: {},
          questionIndex: 0,
          drafts: {},
          reportId: null,
          teaser: null,
        }),
      clearSaved: () => {
        void useTestStore.persist.clearStorage();
      },
    }),
    {
      name: "couplescan-test",
      storage: createJSONStorage(() => sessionStorage),
      /**
       * Bump this whenever the persisted shape changes — `answers` keys, the
       * drafts, or the step counter.
       *
       * Without it, a returning visitor rehydrates state written by an older
       * build and the page reads a field that no longer exists on it, which
       * throws during render rather than degrading. There is nothing here worth
       * migrating (a half-finished test, at most), so a version mismatch drops
       * the state and starts clean.
       */
      version: 6,
      migrate: () => undefined,
      /**
       * The report itself is deliberately absent. `reportId` already survives
       * in the URL that /analyzing redirects to and in the tab-scoped guard the
       * same page writes, and the report is re-fetched from the server on
       * arrival — so saving a copy here would only add a second, staler source
       * of truth. What is worth saving is the part that exists nowhere else:
       * what the couple has typed and how far they've got.
       */
      partialize: (state) => ({
        partner1: state.partner1,
        partner2: state.partner2,
        relationshipStart: state.relationshipStart,
        submissionId: state.submissionId,
        answers: state.answers,
        questionIndex: state.questionIndex,
        drafts: state.drafts,
      }),
    },
  ),
);
