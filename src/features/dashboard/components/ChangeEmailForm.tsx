"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changeClientEmail } from "../api";
import { useCurrentClientUser } from "../hooks/useCurrentClientUser";
import { changeEmailSchema, type ChangeEmailValues } from "../schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function ChangeEmailForm() {
  const { data: user } = useCurrentClientUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailValues>({ resolver: zodResolver(changeEmailSchema) });

  const mutation = useMutation({
    mutationFn: changeClientEmail,
    onSuccess: () => reset(),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="flex flex-col gap-4"
    >
      {user && (
        <p className="text-sm text-ink-muted">
          Поточна пошта: <span className="font-medium text-ink">{user.email}</span>
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium">Нова пошта</label>
        <input type="email" className={inputClass} {...register("newEmail")} />
        {errors.newEmail && <span className={errorClass}>{errors.newEmail.message}</span>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Пароль для підтвердження</label>
        <input type="password" className={inputClass} {...register("password")} />
        {errors.password && <span className={errorClass}>{errors.password.message}</span>}
      </div>

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Пошту змінено</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Змінюємо..." : "Змінити пошту"}
      </button>
    </form>
  );
}
