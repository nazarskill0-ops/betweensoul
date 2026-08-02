"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { submitPartnerApplication } from "../api";
import { partnerApplicationSchema, type PartnerApplicationValues } from "../schema";
import { GENDERS } from "@/features/psychologists/schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const labelClass = "mb-1.5 block text-sm font-medium";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function PartnerApplicationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerApplicationValues>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: { consent: false },
  });

  const mutation = useMutation({
    mutationFn: submitPartnerApplication,
  });

  if (mutation.isSuccess) {
    return (
      <div className="w-full rounded-[20px] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage-light text-2xl text-sage">
          ✓
        </div>
        <h2 className="mb-2 font-bold text-2xl">Заявку надіслано</h2>
        <p className="text-sm text-ink-muted">
          Дякуємо! Ми переглянемо анкету і зв&apos;яжемось з вами протягом
          доби.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="w-full rounded-[20px] bg-white p-8 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Прізвище</label>
          <input
            placeholder="Коваленко"
            className={inputClass}
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className={errorClass}>{errors.lastName.message}</span>
          )}
        </div>

        <div>
          <label className={labelClass}>Ім&apos;я</label>
          <input
            placeholder="Олена"
            className={inputClass}
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className={errorClass}>{errors.firstName.message}</span>
          )}
        </div>

        <div>
          <label className={labelClass}>По батькові (опційно)</label>
          <input
            placeholder="Іванівна"
            className={inputClass}
            {...register("middleName")}
          />
        </div>

        <div>
          <label className={labelClass}>Дата народження</label>
          <input
            type="date"
            className={inputClass}
            {...register("birthDate")}
          />
          {errors.birthDate && (
            <span className={errorClass}>{errors.birthDate.message}</span>
          )}
        </div>

        <div>
          <label className={labelClass}>Стать (опційно)</label>
          {/*
            "Не вказано" дає "", а gender у схемі — optional enum, який ""
            не приймає. Без setValueAs форма мовчки не сабмітиться: помилка
            є, але поля для неї не рендериться.
          */}
          <select
            className={inputClass}
            {...register("gender", {
              setValueAs: (v) => (v === "" ? undefined : v),
            })}
          >
            <option value="">Не вказано</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Номер телефону</label>
          <input
            type="tel"
            placeholder="+380 XX XXX XX XX"
            className={inputClass}
            {...register("phone")}
          />
          {errors.phone && (
            <span className={errorClass}>{errors.phone.message}</span>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && (
            <span className={errorClass}>{errors.email.message}</span>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Коротко про освіту й досвід</label>
          <textarea
            rows={4}
            placeholder="Диплом, спеціалізація, скільки років у практиці..."
            className={`${inputClass} resize-none`}
            {...register("experienceSummary")}
          />
          {errors.experienceSummary && (
            <span className={errorClass}>
              {errors.experienceSummary.message}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-start gap-2.5 text-xs leading-snug text-ink-muted">
          <input
            type="checkbox"
            className="mt-0.5 accent-sage"
            {...register("consent")}
          />
          <span>
            Я даю згоду на обробку моїх персональних даних, погоджуюсь з{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-sage underline"
            >
              Політикою конфіденційності
            </Link>{" "}
            та{" "}
            <Link href="/terms" target="_blank" className="text-sage underline">
              Умовами використання
            </Link>{" "}
            платформи Calmi
          </span>
        </label>
        {errors.consent && (
          <span className={errorClass}>{errors.consent.message}</span>
        )}
      </div>

      {mutation.isError && (
        <p className="mt-4 text-center text-sm font-medium text-rose">
          Не вдалося надіслати заявку. Спробуйте ще раз.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-6 w-full rounded-full bg-sage py-3.5 font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Надсилаємо..." : "Надіслати заявку"}
      </button>
    </form>
  );
}
