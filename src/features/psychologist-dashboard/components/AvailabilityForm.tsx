"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TimePicker } from "@/components/ui/TimePicker";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
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

function ApplyToAllPopover({
  workingDays,
  onApply,
}: {
  workingDays: Weekday[];
  onApply: (window: { start: string; end: string }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [start, setStart] = useState(DEFAULT_DAY_WINDOW.start);
  const [end, setEnd] = useState(DEFAULT_DAY_WINDOW.end);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        disabled={workingDays.length === 0}
        className="rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-sage hover:text-sage disabled:cursor-not-allowed disabled:opacity-50"
      >
        Застосувати для всіх
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-72 rounded-card border-[1.5px] border-sand-dark bg-white p-4 shadow-lg">
          <p className="mb-3 text-xs text-ink-muted">
            Скопіювати ці години в усі позначені робочі дні — інші дні не зміняться.
          </p>
          <div className="flex items-center gap-2">
            <TimePicker label="Початок для всіх" value={start} onChange={setStart} className="flex-1" />
            <span className="text-ink-muted">—</span>
            <TimePicker label="Кінець для всіх" value={end} onChange={setEnd} className="flex-1" />
          </div>
          <button
            type="button"
            onClick={() => {
              onApply({ start, end });
              setIsOpen(false);
            }}
            className="mt-3 w-full rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage/90"
          >
            Застосувати
          </button>
        </div>
      )}
    </div>
  );
}

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

  const workingDays = WEEKDAYS.map((d) => d.value).filter((day) => days?.[day]);

  function applyToAllWorkingDays(window: { start: string; end: string }) {
    workingDays.forEach((day) => setValue(day, window, { shouldValidate: true }));
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-6"
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Робочі дні й години</label>
          <ApplyToAllPopover workingDays={workingDays} onApply={applyToAllWorkingDays} />
        </div>
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
