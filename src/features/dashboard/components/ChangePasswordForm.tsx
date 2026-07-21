"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changeClientPassword } from "../api";
import { changePasswordSchema, type ChangePasswordValues } from "../schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const mutation = useMutation({
    mutationFn: changeClientPassword,
    onSuccess: () => reset(),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="flex flex-col gap-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium">Поточний пароль</label>
        <input type="password" className={inputClass} {...register("currentPassword")} />
        {errors.currentPassword && (
          <span className={errorClass}>{errors.currentPassword.message}</span>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Новий пароль</label>
        <input type="password" className={inputClass} {...register("newPassword")} />
        {errors.newPassword && (
          <span className={errorClass}>{errors.newPassword.message}</span>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Повторіть новий пароль</label>
        <input type="password" className={inputClass} {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <span className={errorClass}>{errors.confirmPassword.message}</span>
        )}
      </div>

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Пароль змінено</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Змінюємо..." : "Змінити пароль"}
      </button>
    </form>
  );
}
