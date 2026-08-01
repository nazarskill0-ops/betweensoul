"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signUp } from "@/features/auth/api";
import {
  AuthDivider,
  GoogleButton,
} from "@/features/auth/components/GoogleButton";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/features/auth/schema";

/*
  Ворота авторизації перед показом результату підбору. Саме модалка, а не
  редірект на /login: анкета вже заповнена, і забирати людину зі сторінки
  означало б загубити контекст «ми вже знайшли вашого психолога».

  Схеми й виклики Supabase переюзані з features/auth — тут лише інша обгортка.
*/

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

function RegisterView({
  onAuthenticated,
  onSwitchToLogin,
}: {
  onAuthenticated: () => void;
  onSwitchToLogin: () => void;
}) {
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
      // Якщо в проєкті увімкнене підтвердження пошти — сесії ще немає, тож
      // результат показати нічим. Чесно кажемо про це замість тихого нічого.
      if (!res.needsEmailConfirm) onAuthenticated();
    },
  });

  if (mutation.isSuccess && mutation.data?.needsEmailConfirm) {
    return (
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-ink">Майже готово</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Ми надіслали лист на вашу пошту. Перейдіть за посиланням — і результат
          підбору відкриється.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
          Ми знайшли вашого психолога
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Зареєструйтесь, щоб побачити результат
        </p>
      </div>

      <div className="mt-6">
        <GoogleButton next="/pidbir" />
        <AuthDivider />
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <input
          placeholder="Ім'я та прізвище"
          autoComplete="name"
          className={inputClass}
          {...register("fullName")}
        />
        {errors.fullName && (
          <span className={errorClass}>{errors.fullName.message}</span>
        )}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className={`${inputClass} mt-3`}
          {...register("email")}
        />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}

        <input
          type="password"
          placeholder="Пароль"
          autoComplete="new-password"
          className={`${inputClass} mt-3`}
          {...register("password")}
        />
        {errors.password && (
          <span className={errorClass}>{errors.password.message}</span>
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs text-ink-muted">
          <input type="checkbox" className="mt-0.5" {...register("consent")} />
          Погоджуюсь на обробку персональних даних
        </label>
        {errors.consent && <span className={errorClass}>{errors.consent.message}</span>}

        {mutation.isError && (
          <span className={errorClass}>{(mutation.error as Error).message}</span>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-5 w-full rounded-full bg-sage py-3.5 font-semibold text-white transition-colors hover:bg-sage/90 disabled:opacity-60"
        >
          {mutation.isPending ? "Реєструємо…" : "Зареєструватись"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Вже маєте профіль?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-sage transition-colors hover:text-sage/80"
        >
          Увійти
        </button>
      </p>
    </>
  );
}

function LoginView({
  onAuthenticated,
  onSwitchToRegister,
}: {
  onAuthenticated: () => void;
  onSwitchToRegister: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: onAuthenticated,
  });

  return (
    <>
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
          З поверненням
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Увійдіть, щоб побачити результат підбору
        </p>
      </div>

      <div className="mt-6">
        <GoogleButton next="/pidbir" />
        <AuthDivider />
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}

        <input
          type="password"
          placeholder="Пароль"
          autoComplete="current-password"
          className={`${inputClass} mt-3`}
          {...register("password")}
        />
        {errors.password && (
          <span className={errorClass}>{errors.password.message}</span>
        )}

        {mutation.isError && (
          <span className={errorClass}>{(mutation.error as Error).message}</span>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-5 w-full rounded-full bg-sage py-3.5 font-semibold text-white transition-colors hover:bg-sage/90 disabled:opacity-60"
        >
          {mutation.isPending ? "Входимо…" : "Увійти"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Ще немає профілю?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-sage transition-colors hover:text-sage/80"
        >
          Зареєструватись
        </button>
      </p>
    </>
  );
}

export function AuthGateModal({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const queryClient = useQueryClient();

  // Сесія змінилась — useUser() має перечитатись, інакше візард і далі
  // вважатиме користувача гостем.
  function handleAuthenticated() {
    queryClient.invalidateQueries({ queryKey: ["user"] });
    onAuthenticated();
  }

  // Escape закриває модалку, поки вона відкрита — очікувана поведінка діалогу.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Реєстрація для перегляду результату"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        // Клік усередині картки не має закривати модалку.
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-card bg-white p-6 shadow-lg md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </button>

        {mode === "register" ? (
          <RegisterView
            onAuthenticated={handleAuthenticated}
            onSwitchToLogin={() => setMode("login")}
          />
        ) : (
          <LoginView
            onAuthenticated={handleAuthenticated}
            onSwitchToRegister={() => setMode("register")}
          />
        )}
      </div>
    </div>
  );
}
