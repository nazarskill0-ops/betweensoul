"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "../api";
import { registerSchema, type RegisterValues } from "../schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { consent: false },
  });

  const mutation = useMutation({
    mutationFn: (v: RegisterValues) => signUp(v, "client"),
    onSuccess: (res) => {
      if (res.needsEmailConfirm) return; // email confirmation on -> no session yet
      router.push("/dashboard");
      router.refresh();
    },
  });

  if (mutation.isSuccess && mutation.data?.needsEmailConfirm) {
    return (
      <div className="w-full rounded-[20px] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage-light text-2xl text-sage">
          ✉
        </div>
        <h1 className="mb-2 font-display text-2xl">Майже готово</h1>
        <p className="text-sm text-ink-muted">
          Ми надіслали лист для підтвердження на вашу пошту. Перейдіть за
          посиланням у листі, щоб завершити реєстрацію.
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
      <h1 className="mb-1 font-display text-2xl text-center">Реєстрація</h1>
      <p className="mb-6 text-sm text-ink-muted text-center">Створіть акаунт за хвилину</p>

      <label className="mb-1.5 block text-sm font-medium">Ім&apos;я та прізвище</label>
      <input placeholder="Олена Коваленко" className={inputClass} {...register("fullName")} />
      {errors.fullName && (
        <span className={errorClass}>{errors.fullName.message}</span>
      )}

      <label className="mt-4 mb-1.5 block text-sm font-medium">Email</label>
      <input
        type="email"
        placeholder="email@example.com"
        className={inputClass}
        {...register("email")}
      />
      {errors.email && <span className={errorClass}>{errors.email.message}</span>}

      <label className="mt-4 mb-1.5 block text-sm font-medium">Пароль</label>
      <input type="password"
      placeholder="••••••••" className={inputClass} {...register("password")} />
      {errors.password && (
        <span className={errorClass}>{errors.password.message}</span>
      )}

      <div className="mt-3">
        <label className="flex items-start gap-2.5 text-xs leading-snug text-ink-muted">
          <input
            type="checkbox"
            className="mt-0.5 accent-sage"
            {...register("consent")}
          />
          <span>
            Я даю згоду на обробку моїх персональних даних, погоджуюсь з{" "}
            <Link href="/privacy" target="_blank" className="text-sage underline">
              Політикою конфіденційності
            </Link>{" "}
            та{" "}
            <Link href="/terms" target="_blank" className="text-sage underline">
              Умовами використання
            </Link>{" "}
            платформи Calmi, і підтверджую, що мені виповнилося 18 років
          </span>
        </label>
        {errors.consent && (
          <span className={errorClass}>{errors.consent.message}</span>
        )}
      </div>

      {mutation.isError && (
        <p className="mt-4 text-center text-sm font-medium text-rose">
          {mutation.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-6 w-full rounded-full bg-sage py-3.5 font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Створюємо..." : "Зареєструватись"}
      </button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Вже є акаунт?{" "}
        <Link href="/login" className="font-medium text-sage">
          Увійти
        </Link>
      </p>
    </form>
  );
}
