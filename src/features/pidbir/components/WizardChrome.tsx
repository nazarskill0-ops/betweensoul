"use client";

import { useEffect, useState } from "react";
import { visibleSteps, type PidbirStep } from "@/stores/pidbir";

/** Сегментований прогрес: по сегменту на екран, пройдені — залиті. */
export function ProgressBar({
  step,
  withCriteria,
}: {
  step: PidbirStep;
  withCriteria: boolean;
}) {
  const steps = visibleSteps(withCriteria);
  // На екрані результатів усі сегменти заповнені.
  const currentIndex = step === "results" ? steps.length : steps.indexOf(step);

  return (
    <div
      className="flex gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={Math.min(currentIndex + 1, steps.length)}
      aria-label="Прогрес анкети"
    >
      {steps.map((s, i) => (
        <span
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i <= currentIndex ? "bg-sage" : "bg-sand-dark"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Плавна поява екрана. Ключем виступає сам крок — при зміні кроку компонент
 * перемонтовується й програє появу заново. Робиться на утилітах Tailwind,
 * щоб не заводити власні keyframes у globals.css.
 */
export function StepTransition({ children }: { children: React.ReactNode }) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isShown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/** Спільний каркас екрана: заголовок, підказка, контент і панель навігації. */
export function StepShell({
  title,
  hint,
  onBack,
  children,
  footer,
}: {
  title: string;
  hint?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>

      {children}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-ink-muted transition-colors hover:text-sage"
          >
            Назад
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{footer}</div>
      </div>
    </div>
  );
}

/** Кнопка-картка варіанта відповіді. Сам input лишається доступним для клавіатури. */
export function OptionCard({
  isSelected,
  icon,
  label,
  description,
  inputProps,
  type,
}: {
  isSelected: boolean;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  type: "radio" | "checkbox";
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-card border-[1.5px] bg-white px-4 py-3.5 transition-colors focus-within:border-sage hover:border-sage ${
        isSelected ? "border-sage bg-sage-light" : "border-sand-dark"
      }`}
    >
      <input type={type} className="sr-only" {...inputProps} />
      {icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            isSelected ? "bg-white text-sage" : "bg-sand text-ink-muted"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`text-sm font-medium ${isSelected ? "text-sage" : "text-ink"}`}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-ink-muted">{description}</span>
        )}
      </span>
    </label>
  );
}

/** Основна кнопка кроку. */
export function PrimaryButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted/40"
    >
      {children}
    </button>
  );
}
