"use client";

import { useRouter } from "next/navigation";
import { Choice, Question, SCALE_POINTS, questions } from "@/lib/questions";
import { PartnerAnswers } from "@/lib/types";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import { partnerPaletteStyle } from "@/lib/partnerColors";

const EMPTY: PartnerAnswers = { p1: "", p2: "" };

const SCALE_STEPS = Array.from({ length: SCALE_POINTS }, (_, i) => String(i + 1));

/** Multi-select answers ride in one string so the store shape stays unchanged. */
function selectedIds(raw: string): string[] {
  return raw.split(",").filter(Boolean);
}

/**
 * Toggles one id in a comma-separated selection.
 *
 * `exclusive` holds the ids that answer the question on their own — "none of
 * these", "wouldn't change a thing". Picking one clears everything else, and
 * picking anything else clears it, so the two can never be selected together
 * and hand the model a contradiction to interpret.
 */
function toggleId(
  raw: string,
  id: string,
  max?: number,
  exclusive?: Set<string>,
): string {
  const current = selectedIds(raw);
  if (current.includes(id)) return current.filter((v) => v !== id).join(",");
  if (exclusive?.has(id)) return id;

  const kept = exclusive ? current.filter((v) => !exclusive.has(v)) : current;
  if (max && kept.length >= max) return kept.join(",");
  return [...kept, id].join(",");
}

/** Every key a question writes — one for most, one per sub-item for blitz/scale. */
function keysFor(question: Question): string[] {
  if (question.type === "blitz") {
    return (question.blitzItems ?? []).map((item) => `${question.id}_${item.id}`);
  }
  if (question.type === "scale") {
    return (question.scaleItems ?? []).map((item) => `${question.id}_${item.id}`);
  }
  return [question.id];
}

function OptionButton({
  selected,
  accent,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  accent: "p1" | "p2" | "both";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const selectedStyles = {
    p1: "border-[var(--color-p1)] bg-[var(--color-p1-soft)] text-slate-900",
    p2: "border-[var(--color-p2)] bg-[var(--color-p2-soft)] text-slate-900",
    both: "border-slate-300 bg-slate-50 text-slate-900",
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl border-2 p-3 text-left text-sm leading-snug transition-all ${
        selected
          ? `${selectedStyles} font-semibold`
          : "border-transparent bg-white text-slate-600 shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-slate-900/5 hover:bg-slate-50"
      } ${disabled && !selected ? "opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}

function ChoiceLabel({ choice }: { choice: Choice }) {
  return (
    <>
      {choice.emoji && <span className="mr-1.5">{choice.emoji}</span>}
      {choice.text}
    </>
  );
}

function PartnerChip({
  accent,
  name,
  about,
  note,
}: {
  accent: "p1" | "p2";
  name: string;
  /** Set on "cross" questions — the partner this answer is about. */
  about?: string;
  note?: string;
}) {
  const styles =
    accent === "p1"
      ? "bg-[var(--color-p1-soft)] text-[var(--color-p1)]"
      : "bg-[var(--color-p2-soft)] text-[var(--color-p2)]";
  return (
    <div className="mb-3 text-center">
      <span className={`pill ${styles} max-w-full truncate`}>
        {about ? `${name} → about ${about}` : name}
      </span>
      {note && <p className="mt-1.5 text-xs text-slate-400">{note}</p>}
    </div>
  );
}

export default function QuestionsPage() {
  const {
    partner1,
    partner2,
    setAnswer,
    // One map for everything, so going Back — or reloading the page — restores
    // what was already picked. It lives in the store rather than in component
    // state because a hard refresh here used to mean starting the quiz over.
    drafts,
    updateDraft,
    questionIndex,
    setQuestionIndex,
  } = useTestStore();
  const hydrated = useStoreHydrated();
  const router = useRouter();

  // A saved index from a build with fewer questions would index past the end.
  const currentIndex = Math.min(questionIndex, questions.length - 1);
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const p1Name = partner1.name || "Partner 1";
  const p2Name = partner2.name || "Partner 2";
  const together = question.answeredBy === "together";
  // "cross" is answered like "each" — only the labelling differs.
  const isCross = question.answeredBy === "cross";

  const get = (key: string) => drafts[key] ?? EMPTY;
  const set = (key: string, patch: Partial<PartnerAnswers>) =>
    updateDraft(key, (current) => ({ ...current, ...patch }));

  /**
   * Multi-select has to derive from the previous state rather than the value
   * captured at render — two toggles landing in the same tick would otherwise
   * both start from the same stale string and one would be dropped.
   */
  const toggleChoice = (
    key: string,
    slot: "p1" | "p2",
    choiceId: string,
    max?: number,
    exclusive?: Set<string>,
  ) =>
    updateDraft(key, (current) => ({
      ...current,
      [slot]: toggleId(current[slot], choiceId, max, exclusive),
    }));

  const isComplete = (key: string, value = get(key)) =>
    together
      ? value.p1.trim() !== ""
      : value.p1.trim() !== "" && value.p2.trim() !== "";

  const canGoNext = () => keysFor(question).every((key) => isComplete(key));

  /** Writes one key into the shared store in the shape the API expects. */
  const commit = (key: string) => {
    const value = get(key);
    setAnswer(key, together ? value.p1 : [value.p1, value.p2]);
  };

  const saveAndNext = () => {
    keysFor(question).forEach(commit);

    if (isLast) {
      router.push("/analyzing");
    } else {
      setQuestionIndex(currentIndex + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setQuestionIndex(currentIndex - 1);
    window.scrollTo({ top: 0 });
  };

  const partnerName = (slot: "p1" | "p2") => (slot === "p1" ? p1Name : p2Name);
  const otherName = (slot: "p1" | "p2") => (slot === "p1" ? p2Name : p1Name);

  // Rendering before the saved answers are back would paint question 1 and then
  // jump to wherever the reader actually was, taking their picks with it.
  if (!hydrated) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <p className="text-sm text-slate-400">Loading your answers…</p>
      </main>
    );
  }

  return (
    <main
      className="flex-1 px-4 py-8"
      style={partnerPaletteStyle(partner1.gender, partner2.gender)}
    >
      <div className="mx-auto w-full max-w-2xl">
        {/* Header + progress */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-600 disabled:opacity-0"
          >
            ← Back
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div key={question.id} className="animate-in-up">
          <h2 className="text-center text-2xl font-bold leading-snug text-slate-900">
            {question.text}
          </h2>
          {question.subtitle && (
            <p className="mt-2 text-center text-sm text-slate-500">
              {question.subtitle}
            </p>
          )}
          {isCross && (
            <p className="mt-2 text-center text-sm font-semibold text-slate-600">
              Answer about your PARTNER, not yourself.
            </p>
          )}

          {/* CHOICE */}
          {question.type === "choice" && question.choices && (
            <div className="mt-7">
              {together ? (
                <div className="space-y-2.5">
                  <div className="mb-4 text-center">
                    <span className="pill bg-slate-100 text-slate-600">
                      Answer together
                    </span>
                  </div>
                  {question.choices.map((choice) => (
                    <OptionButton
                      key={choice.id}
                      accent="both"
                      selected={get(question.id).p1 === choice.id}
                      onClick={() => set(question.id, { p1: choice.id })}
                    >
                      <ChoiceLabel choice={choice} />
                    </OptionButton>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(["p1", "p2"] as const).map((slot) => (
                    <div key={slot}>
                      <PartnerChip
                        accent={slot}
                        name={partnerName(slot)}
                        about={isCross ? otherName(slot) : undefined}
                      />
                      <div className="space-y-2">
                        {question.choices!.map((choice) => (
                          <OptionButton
                            key={choice.id}
                            accent={slot}
                            selected={get(question.id)[slot] === choice.id}
                            onClick={() => set(question.id, { [slot]: choice.id })}
                          >
                            <ChoiceLabel choice={choice} />
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MULTI-SELECT */}
          {question.type === "multi-select" && question.choices && (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-3">
                {(["p1", "p2"] as const).map((slot) => {
                  const raw = get(question.id)[slot];
                  const picked = selectedIds(raw);
                  const max = question.maxSelections;
                  const exclusive = new Set(
                    question.choices!.filter((c) => c.exclusive).map((c) => c.id),
                  );
                  // An exclusive pick never fills the quota — it replaces it —
                  // so it must not grey out everything else on its way in.
                  const atMax =
                    max !== undefined &&
                    picked.filter((id) => !exclusive.has(id)).length >= max;

                  return (
                    <div key={slot}>
                      <PartnerChip
                        accent={slot}
                        name={partnerName(slot)}
                        about={isCross ? otherName(slot) : undefined}
                        note={
                          max
                            ? `${picked.length} of ${max} picked`
                            : picked.length
                              ? `${picked.length} picked`
                              : "Pick all that apply"
                        }
                      />
                      <div className="space-y-2">
                        {question.choices!.map((choice) => (
                          <OptionButton
                            key={choice.id}
                            accent={slot}
                            selected={picked.includes(choice.id)}
                            // An exclusive option is never blocked by the
                            // quota: it clears the others rather than joining
                            // them, and greying it out at three-of-three left
                            // "none of these" unreachable for exactly the
                            // people most likely to want it.
                            disabled={
                              atMax &&
                              !picked.includes(choice.id) &&
                              !choice.exclusive
                            }
                            onClick={() =>
                              toggleChoice(
                                question.id,
                                slot,
                                choice.id,
                                max,
                                exclusive,
                              )
                            }
                          >
                            <ChoiceLabel choice={choice} />
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEXT */}
          {question.type === "text" && (
            <div className="mt-7">
              {together ? (
                <>
                  <div className="mb-4 text-center">
                    <span className="pill bg-slate-100 text-slate-600">
                      Answer together
                    </span>
                  </div>
                  <textarea
                    value={get(question.id).p1}
                    onChange={(e) => set(question.id, { p1: e.target.value })}
                    placeholder={question.placeholder?.partner1 ?? "Type your answer…"}
                    className="field min-h-[130px] resize-none"
                  />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(["p1", "p2"] as const).map((slot) => (
                    <div key={slot}>
                      <PartnerChip
                        accent={slot}
                        name={partnerName(slot)}
                        about={isCross ? otherName(slot) : undefined}
                      />
                      <textarea
                        value={get(question.id)[slot]}
                        onChange={(e) =>
                          set(question.id, { [slot]: e.target.value })
                        }
                        placeholder={
                          (slot === "p1"
                            ? question.placeholder?.partner1
                            : question.placeholder?.partner2) ?? "Type your answer…"
                        }
                        className="field min-h-[150px] resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BLITZ */}
          {question.type === "blitz" && question.blitzItems && (
            <div className="mt-7 space-y-3">
              {question.blitzItems.map((item) => {
                const key = `${question.id}_${item.id}`;
                const value = get(key);

                const verdictButton = (
                  slot: "p1" | "p2",
                  verdict: "fine" | "dealbreaker",
                ) => (
                  <button
                    type="button"
                    onClick={() => set(key, { [slot]: verdict })}
                    className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold transition-all ${
                      value[slot] === verdict
                        ? verdict === "fine"
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {verdict === "fine" ? "👍 Fine" : "👎 Dealbreaker"}
                  </button>
                );

                return (
                  <div key={item.id} className="card p-4">
                    <p className="mb-3 text-center font-semibold text-slate-900">
                      {item.statement}
                    </p>
                    {together ? (
                      <div className="flex justify-center gap-3">
                        {verdictButton("p1", "fine")}
                        {verdictButton("p1", "dealbreaker")}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {(["p1", "p2"] as const).map((slot) => (
                          <div key={slot} className="space-y-2">
                            <p
                              className="truncate text-center text-xs font-bold"
                              style={{
                                color: `var(--color-${slot})`,
                              }}
                            >
                              {partnerName(slot)}
                            </p>
                            {/* Stacked on phones — "Dealbreaker" doesn't fit
                                two-up in a half-width column. */}
                            <div className="flex flex-col gap-2 sm:flex-row">
                              {verdictButton(slot, "fine")}
                              {verdictButton(slot, "dealbreaker")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SCALE */}
          {question.type === "scale" && question.scaleItems && (
            <div className="mt-7 space-y-3">
              {question.scaleItems.map((item) => {
                const key = `${question.id}_${item.id}`;
                const value = get(key);

                const stepRow = (slot: "p1" | "p2") => (
                  <div className="flex gap-1.5">
                    {SCALE_STEPS.map((step) => {
                      const selected = value[slot] === step;
                      return (
                        <button
                          key={step}
                          type="button"
                          aria-label={`${item.left} to ${item.right}: ${step} of ${SCALE_POINTS}`}
                          onClick={() => set(key, { [slot]: step })}
                          className={`h-8 flex-1 rounded-lg border-2 transition-all ${
                            selected
                              ? ""
                              : "border-transparent bg-slate-50 hover:bg-slate-100"
                          }`}
                          style={
                            selected
                              ? {
                                  borderColor: `var(--color-${slot})`,
                                  background: `var(--color-${slot}-soft)`,
                                }
                              : undefined
                          }
                        >
                          <span
                            className={
                              selected
                                ? "text-xs font-bold"
                                : "text-xs font-semibold text-slate-400"
                            }
                            style={
                              selected ? { color: `var(--color-${slot})` } : undefined
                            }
                          >
                            {step}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );

                return (
                  <div key={item.id} className="card p-4">
                    <div className="mb-3 flex items-start justify-between gap-3 text-xs font-semibold text-slate-500">
                      <span className="flex-1 text-left">{item.left}</span>
                      <span className="flex-1 text-right">{item.right}</span>
                    </div>
                    {together ? (
                      stepRow("p1")
                    ) : (
                      <div className="space-y-2.5">
                        {(["p1", "p2"] as const).map((slot) => (
                          <div key={slot} className="space-y-1.5">
                            <p
                              className="truncate text-center text-xs font-bold"
                              style={{ color: `var(--color-${slot})` }}
                            >
                              {partnerName(slot)}
                            </p>
                            {stepRow(slot)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={saveAndNext}
          disabled={!canGoNext()}
          className="btn-primary mt-8"
        >
          {isLast ? "See Our Results ♥" : "Next"}
        </button>

        <p className="mt-5 text-center text-xs text-slate-400">
          Don&rsquo;t try to answer &ldquo;correctly&rdquo; — answer how you
          really feel.
        </p>
      </div>
    </main>
  );
}
