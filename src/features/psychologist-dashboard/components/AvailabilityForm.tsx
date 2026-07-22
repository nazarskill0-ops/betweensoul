"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TimePicker } from "@/components/ui/TimePicker";
import { updateAvailability } from "../api";
import { useAvailability } from "../hooks/useAvailability";
import { availabilitySchema, WEEKDAYS, type AvailabilityValues, type Weekday } from "../schema";

const errorClass = "mt-1.5 block text-xs font-medium text-rose";

export function AvailabilityForm() {
  const { data } = useAvailability();
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AvailabilityValues>({ resolver: zodResolver(availabilitySchema) });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const workingDays = watch("workingDays") ?? [];
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const mutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["psychologist-dashboard", "availability"] }),
  });

  function toggleDay(day: Weekday) {
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day];
    setValue("workingDays", next, { shouldValidate: true });
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">Робочі дні</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const isActive = workingDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`h-10 w-14 rounded-full border-[1.5px] text-sm font-medium transition-colors ${
                  isActive
                    ? "border-sage bg-sage-light text-sage"
                    : "border-sand-dark text-ink-muted hover:border-sage"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        {errors.workingDays && <span className={errorClass}>{errors.workingDays.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Початок</label>
          <TimePicker
            label="Початок робочого дня"
            value={startTime ?? ""}
            onChange={(v) => setValue("startTime", v, { shouldValidate: true })}
          />
          {errors.startTime && <span className={errorClass}>{errors.startTime.message}</span>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Кінець</label>
          <TimePicker
            label="Кінець робочого дня"
            value={endTime ?? ""}
            onChange={(v) => setValue("endTime", v, { shouldValidate: true })}
          />
          {errors.endTime && <span className={errorClass}>{errors.endTime.message}</span>}
        </div>
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
