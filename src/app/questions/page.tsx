"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Choice, Question, SCALE_POINTS, questions } from "@/lib/questions";
import { useTestStore } from "@/store/useTestStore";

type PartnerAnswers = { p1: string; p2: string };

const EMPTY: PartnerAnswers = { p1: "", p2: "" };

/**
 * Keyed by question id — or `${questionId}_${itemId}` for the blitz round and
 * the scale question, which store one answer per sub-item.
 */
type AnswerMap = Record<string, PartnerAnswers>;

const SCALE_STEPS = Array.from({ length: SCALE_POINTS }, (_, i) => String(i + 1));

/** Multi-select answers ride in one string so the store shape stays unchanged. */
function selectedIds(raw: string): string[] {
  return raw.split(",").filter(Boolean);
}

function toggleId(raw: string, id: string, max?: number): string {
  const current = selectedIds(raw);
  if (current.includes(id)) return current.filter((v) => v !== id).join(",");
  if (max && current.length >= max) return raw;
  return [...current, id].join(",");
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
    p1: "border-[var(--color-p1)] bg-[var(--color-p1-soft)] text-ink-900",
    p2: "border-[var(--color-p2)] bg-[var(--color-p2-soft)] text-ink-900",
    both: "border-lilac-400 bg-lilac-50 text-ink-900",
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl border-2 p-3 text-left text-sm leading-snug transition-all ${
        selected
          ? `${selectedStyles} font-semibold`
          : "border-transparent bg-white text-ink-700 shadow-[0_2px_10px_-6px_rgba(90,60,110,0.4)] hover:bg-blush-50"
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
      {note && <p className="mt-1.5 text-xs text-ink-300">{note}</p>}
    </div>
  );
}

export default function QuestionsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // One map for everything, so going Back restores what was already picked.
  const [answers, setAnswers] = useState<AnswerMap>({});

  const { partner1, partner2, setAnswer } = useTestStore();
  const router = useRouter();

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const p1Name = partner1.name || "Partner 1";
  const p2Name = partner2.name || "Partner 2";
  const together = question.answeredBy === "together";
  // "cross" is answered like "each" — only the labelling differs.
  const isCross = question.answeredBy === "cross";

  const get = (key: string) => answers[key] ?? EMPTY;
  const set = (key: string, patch: Partial<PartnerAnswers>) =>
    setAnswers((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? EMPTY), ...patch },
    }));

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
  ) =>
    setAnswers((prev) => {
      const current = prev[key] ?? EMPTY;
      return {
        ...prev,
        [key]: { ...current, [slot]: toggleId(current[slot], choiceId, max) },
      };
    });

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
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    window.scrollTo({ top: 0 });
  };

  const partnerName = (slot: "p1" | "p2") => (slot === "p1" ? p1Name : p2Name);
  const otherName = (slot: "p1" | "p2") => (slot === "p1" ? p2Name : p1Name);

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header + progress */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="text-sm font-semibold text-ink-500 transition-colors hover:text-ink-700 disabled:opacity-0"
          >
            ← Back
          </button>
          <span className="text-sm font-semibold text-ink-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blush-400 to-lilac-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div key={question.id} className="animate-in-up">
          <h2 className="text-center text-2xl font-extrabold leading-snug text-ink-900">
            {question.text}
          </h2>
          {question.subtitle && (
            <p className="mt-2 text-center text-sm text-ink-500">
              {question.subtitle}
            </p>
          )}
          {isCross && (
            <p className="mt-2 text-center text-sm font-semibold text-lilac-500">
              Answer about your PARTNER, not yourself.
            </p>
          )}

          {/* CHOICE */}
          {question.type === "choice" && question.choices && (
            <div className="mt-7">
              {together ? (
                <div className="space-y-2.5">
                  <div className="mb-4 text-center">
                    <span className="pill bg-lilac-100 text-lilac-500">
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
                  const atMax = max !== undefined && picked.length >= max;

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
                            disabled={atMax && !picked.includes(choice.id)}
                            onClick={() =>
                              toggleChoice(question.id, slot, choice.id, max)
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
                    <span className="pill bg-lilac-100 text-lilac-500">
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
                        : "border-transparent bg-blush-50 text-ink-500 hover:bg-blush-100"
                    }`}
                  >
                    {verdict === "fine" ? "👍 Fine" : "👎 Dealbreaker"}
                  </button>
                );

                return (
                  <div key={item.id} className="card p-4">
                    <p className="mb-3 text-center font-semibold text-ink-900">
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
                              : "border-transparent bg-blush-50 hover:bg-blush-100"
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
                                : "text-xs font-semibold text-ink-300"
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
                    <div className="mb-3 flex items-start justify-between gap-3 text-xs font-semibold text-ink-500">
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

        <p className="mt-5 text-center text-xs text-ink-300">
          Don&rsquo;t try to answer &ldquo;correctly&rdquo; — answer how you
          really feel.
        </p>
      </div>
    </main>
  );
}
