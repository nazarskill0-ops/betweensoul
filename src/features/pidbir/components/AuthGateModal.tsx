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
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const queryClient = useQueryClient();

  /*
    М'яка поява замість різкого стрибка. Клас перемикається вже після
    монтування (у rAF, тож ефект лишається асинхронним), інакше браузер
    відрендерив би одразу кінцевий стан і переходу не було б видно.
  */
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Сесія змінилась — useUser() має перечитатись, інакше візард і далі
  // вважатиме користувача гостем.
  function handleAuthenticated() {
    queryClient.invalidateQueries({ queryKey: ["user"] });
    onAuthenticated();
  }

  /*
    Поки ворота відкриті, сторінка під ними не гортається. Прибирати клас
    треба саме в cleanup: інакше після реєстрації body лишився б замкненим.
  */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    /*
      Блокуючі ворота: backdrop розмиває результат під собою, скрол сторінки
      замкнено, закрити нічим — вийти можна лише реєстрацією чи входом.
      Свідомо без хрестика й без Escape, тому і фокус звідси нікуди не веде.
    */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Реєстрація для перегляду результату"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 p-4 py-10 backdrop-blur-md transition-opacity duration-500 ease-out ${
        isShown ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative my-auto w-full max-w-md rounded-card bg-white p-6 shadow-xl transition-all duration-500 ease-out md:p-8 ${
          isShown ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.98]"
        }`}
      >
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
