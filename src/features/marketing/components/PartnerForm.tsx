"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  SPECIALIZATIONS,
  CLIENT_CATEGORIES,
} from "@/features/psychologists/schema";

/*
  Partner sign-up form for the landing page.
  Demonstrates the project's form stack: react-hook-form + Zod.
  Still posts to Formspree for now — swap for our own endpoint once the
  backend is ready (create a lead row / notify admin).
*/

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xgojwrlq";

const EXPERIENCE_OPTIONS = [
  "До 2 років",
  "2–5 років",
  "5–10 років",
  "10+ років",
];

const schema = z.object({
  name: z.string().min(2, "Введіть ім'я та прізвище"),
  phone: z.string().min(5, "Введіть номер телефону"),
  email: z.string().email("Невірний формат email"),
  specializations: z.array(z.string()).min(1, "Оберіть хоча б одну спеціалізацію"),
  experience: z.string().min(1, "Оберіть досвід роботи"),
  categories: z.array(z.string()),
  about: z.string().optional(),
  agree: z.boolean().refine((v) => v === true, {
    message: "Необхідно погодитись з обробкою даних",
  }),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";
const labelClass = "mb-1.5 block text-sm font-medium";

export function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { specializations: [], categories: [], about: "" },
  });

  async function onSubmit(values: FormValues) {
    setNetworkError(false);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("bad response");
      setSubmitted(true);
    } catch {
      setNetworkError(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[20px] bg-white p-9 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-light text-3xl text-sage">
          ✓
        </div>
        <h3 className="mb-2 font-display text-2xl">Заявку отримано!</h3>
        <p className="text-ink-muted">
          Ми зв&apos;яжемось з вами.
          <br />
          Дякуємо, що обираєте Calmi.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[20px] bg-white p-9 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Ім&apos;я та прізвище <span className="text-rose">*</span>
          </label>
          <input
            id="name"
            placeholder="Олена Коваленко"
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <span className={errorClass}>{errors.name.message}</span>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Телефон <span className="text-rose">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+380 XX XXX XXXX"
            className={inputClass}
            {...register("phone")}
          />
          {errors.phone && (
            <span className={errorClass}>{errors.phone.message}</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="email" className={labelClass}>
          Email <span className="text-rose">*</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@example.com"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}
      </div>

      <div className="mt-4">
        <label className={labelClass}>
          Основна спеціалізація <span className="text-rose">*</span>
        </label>
        <Controller
          control={control}
          name="specializations"
          render={({ field }) => (
            <MultiSelect
              placeholder="Оберіть напрямок"
              options={SPECIALIZATIONS.map((s) => ({ value: s, label: s }))}
              value={field.value}
              onChange={field.onChange}
              hasError={!!errors.specializations}
            />
          )}
        />
        {errors.specializations && (
          <span className={errorClass}>{errors.specializations.message}</span>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor="experience" className={labelClass}>
          Досвід роботи <span className="text-rose">*</span>
        </label>
        <select
          id="experience"
          defaultValue=""
          className={inputClass}
          {...register("experience")}
        >
          <option value="" disabled>
            Роки практики
          </option>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        {errors.experience && (
          <span className={errorClass}>{errors.experience.message}</span>
        )}
      </div>

      <div className="mt-4">
        <label className={labelClass}>
          З якими категоріями клієнтів працюєте?
        </label>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <MultiSelect
              placeholder="Оберіть категорії"
              options={CLIENT_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="about" className={labelClass}>
          Про себе (необов&apos;язково)
        </label>
        <textarea
          id="about"
          rows={4}
          placeholder="Кілька слів про ваш підхід або з чим ви найчастіше працюєте..."
          className={`${inputClass} min-h-24 resize-y`}
          {...register("about")}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2.5">
          <input
            id="agree"
            type="checkbox"
            className="mt-0.5 shrink-0 accent-sage"
            {...register("agree")}
          />
          <label htmlFor="agree" className="text-xs leading-snug text-ink-muted">
            Я погоджуюсь з{" "}
            <a href="/privacy" className="text-sage">
              обробкою персональних даних
            </a>{" "}
            відповідно до Політики конфіденційності Calmi
          </label>
        </div>
        {errors.agree && <span className={errorClass}>{errors.agree.message}</span>}
      </div>

      {networkError && (
        <p className="mt-4 text-center text-xs font-medium text-rose">
          Помилка з&apos;єднання. Перевірте інтернет і спробуйте ще раз.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-full bg-sage py-4 font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {isSubmitting ? "Відправляємо..." : "Надіслати заявку →"}
      </button>
      <p className="mt-3.5 text-center text-xs text-ink-muted">
        Ваші дані надійно захищені та не передаються третім особам
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* A small checkbox-dropdown multi-select. Local to this feature for  */
/* now; promote to components/ui if another feature needs it.         */
/* ------------------------------------------------------------------ */
function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  hasError,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div ref={ref} className="relative select-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-[10px] border-[1.5px] bg-sand px-4 py-3 text-left text-sm transition-colors ${
          hasError ? "border-rose" : open ? "border-sage" : "border-sand-dark"
        }`}
      >
        <span
          className={`truncate ${
            selectedLabels.length ? "text-ink" : "text-ink-muted"
          }`}
        >
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        <span
          className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-[10px] border-[1.5px] border-sage bg-white shadow-lg">
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-sage-light"
            >
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="h-4 w-4 accent-sage"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
