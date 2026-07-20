"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "../api";
import { loginSchema, type LoginValues } from "../schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerHref =
    searchParams.get("role") === "therapist" ? "/therapist-register" : "/register";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="w-full rounded-[20px] bg-white p-8 shadow-sm"
    >
      <h1 className="mb-1 font-display text-2xl text-center">Вхід</h1>
      <p className="mb-6 text-sm text-ink-muted text-center">Раді бачити вас знову</p>

      <label className="mb-1.5 block text-sm font-medium">Email</label>
      <input
        type="email"
        placeholder="email@example.com"
        className={inputClass}
        {...register("email")}
      />
      {errors.email && <span className={errorClass}>{errors.email.message}</span>}

      <label className="mt-4 mb-1.5 block text-sm font-medium">Пароль</label>
      <input type="password" className={inputClass} {...register("password")} />
      {errors.password && (
        <span className={errorClass}>{errors.password.message}</span>
      )}

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
        {mutation.isPending ? "Входимо..." : "Увійти"}
      </button>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Немає акаунта?{" "}
        <Link href={registerHref} className="font-medium text-sage">
          Зареєструватись
        </Link>
      </p>
    </form>
  );
}
