"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GENDERS } from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import {
  PRICE_OPTIONS,
  criteriaFormSchema,
  criteriaToFormValues,
  normalizeCriteria,
  type CriteriaFormValues,
} from "../schema";
import { PrimaryButton, StepShell } from "./WizardChrome";

/** Пігулка радіо-варіанта. "" = «не має значення», порожнє значення поля. */
function PillRadio({
  label,
  value,
  current,
  inputProps,
}: {
  label: string;
  value: string;
  current: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const isSelected = current === value;
  return (
    <label
      className={`cursor-pointer rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors focus-within:border-sage hover:border-sage ${
        isSelected
          ? "border-sage bg-sage-light text-sage"
          : "border-sand-dark bg-white text-ink"
      }`}
    >
      <input type="radio" className="sr-only" value={value} {...inputProps} />
      {label}
    </label>
  );
}

export function CriteriaStep() {
  const { criteria, setCriteria, goTo } = usePidbirStore();
  const { register, handleSubmit, watch } = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaFormSchema),
    defaultValues: criteriaToFormValues(criteria),
  });

  // Порожній рядок означає «байдуже» — і саме він має підсвічувати перший варіант.
  const gender = watch("gender");
  const priceMax = watch("priceMaxMinor");

  function onSubmit(values: CriteriaFormValues) {
    setCriteria(normalizeCriteria(values));
    goTo("results");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepShell
        title="Є побажання до спеціаліста?"
        hint="Необов'язково — без них підбір теж працює"
        onBack={() => goTo("timeFocus")}
        footer={<PrimaryButton>Показати результати</PrimaryButton>}
      >
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Стать психолога
            </legend>
            <div className="flex flex-wrap gap-2">
              <PillRadio
                label="Не має значення"
                value=""
                current={gender}
                inputProps={register("gender")}
              />
              {GENDERS.map((g) => (
                <PillRadio
                  key={g.value}
                  label={g.label}
                  value={g.value}
                  current={gender}
                  inputProps={register("gender")}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Вартість сесії
            </legend>
            <div className="flex flex-wrap gap-2">
              <PillRadio
                label="Не має значення"
                value=""
                current={priceMax}
                inputProps={register("priceMaxMinor")}
              />
              {PRICE_OPTIONS.map((option) => (
                <PillRadio
                  key={option.value}
                  label={option.label}
                  value={String(option.value)}
                  current={priceMax}
                  inputProps={register("priceMaxMinor")}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </StepShell>
    </form>
  );
}
