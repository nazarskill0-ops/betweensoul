"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePidbirStore } from "@/stores/pidbir";
import { profileSchema, type ProfileValues } from "../schema";
import { SectionRow, SubmitButton } from "./WizardUI";

const inputClass =
  "w-full rounded-card border-[1.5px] border-sand-dark bg-white px-4 py-3.5 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-sage";

export function ProfileStep() {
  const { profile, setProfile, goTo } = usePidbirStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const consent = watch("consent");

  function onSubmit(values: ProfileValues) {
    setProfile(values);
    goTo("request");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SectionRow title="Ваш профіль">
        <div className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-rose">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Ім'я"
              autoComplete="given-name"
              className={inputClass}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-rose">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Вік (необов'язково)"
              className={inputClass}
              {...register("age")}
            />
            {errors.age && (
              <p className="mt-1.5 text-sm text-rose">{errors.age.message}</p>
            )}
          </div>

          <SubmitButton>Далі</SubmitButton>

          {/* Згода вимкнена за замовчуванням — жодних попередньо поставлених галочок. */}
          <label className="mt-1 flex cursor-pointer items-start gap-3 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setValue("consent", e.target.checked)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors ${
                consent ? "border-sage bg-sage text-white" : "border-sand-dark bg-white"
              }`}
            >
              {consent && (
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
            Отримувати інформацію про сесії, корисні матеріали та персональні
            пропозиції
          </label>
        </div>
      </SectionRow>
    </form>
  );
}
