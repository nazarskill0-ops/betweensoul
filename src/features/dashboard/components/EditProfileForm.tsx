"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateClientProfile } from "../api";
import { useCurrentClientUser } from "../hooks/useCurrentClientUser";
import { editProfileSchema, type EditProfileValues } from "../schema";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";
const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function EditProfileForm() {
  const { data: user } = useCurrentClientUser();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileValues>({ resolver: zodResolver(editProfileSchema) });

  useEffect(() => {
    if (!user) return;
    reset({ fullName: user.fullName, email: user.email, phone: user.phone ?? "" });
    setAvatarPreview(user.avatarUrl);
  }, [user, reset]);

  const mutation = useMutation({ mutationFn: updateClientProfile });

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        {avatarPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarPreview}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-full bg-sage-light" />
        )}
        <label className="cursor-pointer rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage">
          Змінити фото
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Ім&apos;я та прізвище</label>
        <input className={inputClass} {...register("fullName")} />
        {errors.fullName && <span className={errorClass}>{errors.fullName.message}</span>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Email</label>
        <input type="email" className={inputClass} {...register("email")} />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Телефон</label>
        <input type="tel" className={inputClass} {...register("phone")} />
        {errors.phone && <span className={errorClass}>{errors.phone.message}</span>}
      </div>

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Зміни збережено</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Зберігаємо..." : "Зберегти зміни"}
      </button>
    </form>
  );
}
