"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePidbirStore, type PidbirStep } from "@/stores/pidbir";
import { STYLE_QUESTIONS, type StyleAxis, type StyleValue } from "../schema";
import { OptionCard, PrimaryButton, StepShell } from "./WizardChrome";
import { StyleAxisIcon } from "./StyleAxisIcon";
import { SlidersIcon } from "./icons";

/*
  Поле тримає рядок, а не число: react-hook-form не застосовує valueAsNumber до
  radio-груп, тож число тут перетворювало б значення на NaN і крок ніколи не
  проходив би валідацію. Конвертуємо вже на сабміті.
*/
const answerSchema = z.object({
  value: z.enum(["1", "2", "3", "4", "5"], { message: "Оберіть один із варіантів" }),
});
type AnswerValues = z.infer<typeof answerSchema>;

/** Куди вести з кожного питання стилю: попередній екран і наступний. */
const FLOW: Record<StyleAxis, { prev: PidbirStep; next: PidbirStep }> = {
  structure: { prev: "topics", next: "lead" },
  lead: { prev: "structure", next: "timeFocus" },
  timeFocus: { prev: "lead", next: "results" },
};

export function StyleStep({ axis }: { axis: StyleAxis }) {
  const { style, setStyleAnswer, goTo, openCriteria } = usePidbirStore();
  const question = STYLE_QUESTIONS.find((q) => q.axis === axis)!;
  const { prev, next } = FLOW[axis];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      value: style[axis] ? (String(style[axis]) as AnswerValues["value"]) : undefined,
    },
  });

  const selected = watch("value");

  // Той самий обробник для обох кнопок останнього кроку: спершу зберігаємо
  // відповідь, потім вирішуємо, куди йти — на результати чи в уточнення.
  const submitTo = (target: PidbirStep | "criteria") =>
    handleSubmit(({ value }) => {
      setStyleAnswer(axis, Number(value) as StyleValue);
      if (target === "criteria") openCriteria();
      else goTo(target);
    });

  const isLastStyleQuestion = axis === "timeFocus";

  return (
    <form onSubmit={submitTo(next)} noValidate>
      <StepShell
        title={question.title}
        hint={question.hint}
        onBack={() => goTo(prev)}
        footer={
          <>
            {isLastStyleQuestion && (
              <button
                type="button"
                disabled={!selected}
                onClick={submitTo("criteria")}
                className="flex items-center justify-center gap-2 rounded-full border-[1.5px] border-sand-dark px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SlidersIcon className="h-4 w-4" />
                Уточнити критерії
              </button>
            )}
            <PrimaryButton disabled={!selected}>
              {isLastStyleQuestion ? "Показати результати" : "Далі"}
            </PrimaryButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <OptionCard
              key={option.value}
              type="radio"
              isSelected={selected === String(option.value)}
              icon={
                <StyleAxisIcon
                  axis={axis}
                  value={option.value}
                  className="[&>svg]:h-5 [&>svg]:w-5"
                />
              }
              label={option.label}
              inputProps={{ value: option.value, ...register("value") }}
            />
          ))}
        </div>

        {errors.value && (
          <p className="text-sm font-medium text-rose">{errors.value.message}</p>
        )}
      </StepShell>
    </form>
  );
}
