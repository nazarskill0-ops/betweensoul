"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateNotificationSettings } from "../api";
import { useNotificationSettings } from "../hooks/useNotificationSettings";
import { notificationSettingsSchema, type NotificationSettingsValues } from "../schema";

const TOGGLE_ITEMS: { name: keyof NotificationSettingsValues; label: string; hint: string }[] = [
  {
    name: "emailReminders",
    label: "Нагадування про сесії на email",
    hint: "Лист за добу та за годину до сесії",
  },
  {
    name: "smsReminders",
    label: "SMS-нагадування",
    hint: "Коротке нагадування за годину до сесії",
  },
  {
    name: "marketingEmails",
    label: "Новини та поради",
    hint: "Іноді надсилаємо корисні матеріали від Calmi",
  },
];

export function NotificationSettingsForm() {
  const { data } = useNotificationSettings();
  const { register, handleSubmit, reset } = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({ mutationFn: updateNotificationSettings });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-col gap-5"
    >
      {TOGGLE_ITEMS.map((item) => (
        <label key={item.name} className="flex items-start justify-between gap-4">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-ink">{item.label}</span>
            <span className="text-xs text-ink-muted">{item.hint}</span>
          </span>
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-sage"
            {...register(item.name)}
          />
        </label>
      ))}

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Налаштування збережено</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-fit rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
      >
        {mutation.isPending ? "Зберігаємо..." : "Зберегти"}
      </button>
    </form>
  );
}
