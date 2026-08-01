"use client";

import {
  PIDBIR_PROGRESS_LABELS,
  PIDBIR_PROGRESS_STEPS,
  type PidbirProgressStep,
} from "@/stores/pidbir";

/*
  Спільні примітиви анкети: прогрес, двоколонковий рядок секції, пігулки
  вибору. Тримаються разом, бо всі три кроки складені з тих самих деталей.
*/

/**
 * Прогрес зверху сторінки: пройдені та активний крок — sage, майбутні — сірі.
 * Пройдені кроки клікабельні (повернення зі збереженням уже введених даних),
 * поточний і майбутні — ні: вперед стрибати не можна, бо крок попереду ще не
 * заповнений і його валідація не пройдена.
 */
export function ProgressSteps({
  current,
  onNavigate,
}: {
  current: PidbirProgressStep;
  onNavigate: (step: PidbirProgressStep) => void;
}) {
  const currentIndex = PIDBIR_PROGRESS_STEPS.indexOf(current);

  return (
    <nav aria-label="Прогрес анкети" className="grid grid-cols-3 gap-3 md:gap-6">
      {PIDBIR_PROGRESS_STEPS.map((step, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isClickable = i < currentIndex;

        return (
          <div key={step} className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onNavigate(step)}
              aria-current={isCurrent ? "step" : undefined}
              className={`text-center text-sm transition-colors ${
                isCurrent ? "font-medium text-sage" : "text-ink-muted"
              } ${
                isClickable
                  ? "cursor-pointer hover:text-sage"
                  : "cursor-default disabled:opacity-100"
              }`}
            >
              {PIDBIR_PROGRESS_LABELS[step]}
            </button>
            <span
              className={`h-1 rounded-full transition-colors ${
                isDone ? "bg-sage" : "bg-sand-dark"
              }`}
            />
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Рядок секції: заголовок ліворуч, контент праворуч на десктопі й одна
 * колонка на мобільному.
 */
export function SectionRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Сегментований перемикач (Для себе / Для пари тощо). */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-full border-[1.5px] border-sand-dark bg-white p-1"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-sage text-white" : "text-ink hover:text-sage"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Пігулка з множинним вибором (теми, методи) або необов'язковим одиничним. */
export function SelectablePill({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`rounded-full border-[1.5px] px-4 py-2 text-left text-sm transition-colors ${
        isSelected
          ? "border-sage bg-sage-light font-medium text-sage"
          : "border-sand-dark bg-white text-ink hover:border-sage"
      }`}
    >
      {label}
    </button>
  );
}

/** Чекбокс теми — саме чекбокс, а не пігулка: список довгий і сканується очима. */
export function TopicCheckbox({
  label,
  isSelected,
  onToggle,
}: {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors ${
          isSelected ? "border-sage bg-sage text-white" : "border-sand-dark bg-white"
        }`}
      >
        {isSelected && (
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

/** Основна кнопка кроку — на всю ширину контентного блоку. */
export function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-full bg-sage px-8 py-4 font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted/40"
    >
      {children}
    </button>
  );
}
