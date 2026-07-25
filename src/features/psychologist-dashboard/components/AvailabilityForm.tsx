"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TimePicker } from "@/components/ui/TimePicker";
import { updateAvailability } from "../api";
import { useAvailability } from "../hooks/useAvailability";
import {
  weeklyAvailabilitySchema,
  WEEKDAYS,
  type AvailabilityValues,
  type Weekday,
} from "../schema";

const errorClass = "mt-1.5 block text-xs font-medium text-rose";
const DEFAULT_DAY_WINDOW = { start: "09:00", end: "18:00" };

export function AvailabilityForm() {
  const { data } = useAvailability();
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AvailabilityValues>({ resolver: zodResolver(weeklyAvailabilitySchema) });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const days = watch();
  const hasWorkingDay = WEEKDAYS.some((day) => days?.[day.value]);

  const mutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["psychologist-dashboard", "availability"] }),
  });

  function toggleDay(day: Weekday) {
    setValue(day, days?.[day] ? null : DEFAULT_DAY_WINDOW, { shouldValidate: true });
  }

  function setDayTime(day: Weekday, field: "start" | "end", value: string) {
    const current = days?.[day] ?? DEFAULT_DAY_WINDOW;
    setValue(day, { ...current, [field]: value }, { shouldValidate: true });
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Робочі дні й години</label>
        <div className="flex flex-col divide-y divide-sand-dark">
          {WEEKDAYS.map((day) => {
            const window = days?.[day.value];
            const isActive = !!window;
            const dayError = errors[day.value];

            return (
              <div key={day.value} className="flex flex-wrap items-center gap-4 py-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`h-10 w-14 shrink-0 rounded-full border-[1.5px] text-sm font-medium transition-colors ${
                    isActive
                      ? "border-sage bg-sage-light text-sage"
                      : "border-sand-dark text-ink-muted hover:border-sage"
                  }`}
                >
                  {day.label}
                </button>

                {isActive ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <TimePicker
                      label={`Початок — ${day.label}`}
                      value={window.start}
                      onChange={(v) => setDayTime(day.value, "start", v)}
                      className="w-32"
                    />
                    <span className="text-ink-muted">—</span>
                    <TimePicker
                      label={`Кінець — ${day.label}`}
                      value={window.end}
                      onChange={(v) => setDayTime(day.value, "end", v)}
                      className="w-32"
                    />
                    {dayError && (
                      <span className={errorClass}>
                        {(dayError as { end?: { message?: string } }).end?.message}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-ink-muted">Вихідний</span>
                )}
              </div>
            );
          })}
        </div>
        {!hasWorkingDay && <span className={errorClass}>Оберіть хоча б один робочий день</span>}
      </div>

      {mutation.isSuccess && (
        <p className="text-sm font-medium text-sage">Розклад збережено</p>
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
