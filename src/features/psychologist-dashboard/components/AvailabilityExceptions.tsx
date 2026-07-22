"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { addAvailabilityException, removeAvailabilityException } from "../api";
import { useAvailabilityExceptions } from "../hooks/useAvailabilityExceptions";
import { addExceptionSchema, type AddExceptionValues } from "../schema";
import { formatExceptionRange } from "../utils/formatExceptionRange";
import { TrashIcon } from "./icons";

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-sand-dark bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-sage";

const EXCEPTIONS_QUERY_KEY = ["psychologist-dashboard", "availability-exceptions"];

export function AvailabilityExceptions() {
  const { data: exceptions, isLoading } = useAvailabilityExceptions();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddExceptionValues>({ resolver: zodResolver(addExceptionSchema) });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const addMutation = useMutation({
    mutationFn: addAvailabilityException,
    onSuccess: (next) => {
      queryClient.setQueryData(EXCEPTIONS_QUERY_KEY, next);
      reset();
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeAvailabilityException,
    onSuccess: (next) => queryClient.setQueryData(EXCEPTIONS_QUERY_KEY, next),
  });

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
      <div>
        <h2 className="font-display text-lg text-ink">Винятки</h2>
        <p className="text-sm text-ink-muted">
          Позначте дні, коли ви недоступні — відпустка, лікарняний тощо.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => addMutation.mutate(v))}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="w-56">
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Дати (клікніть &laquo;з&raquo;, потім &laquo;по&raquo; — або лише один день)
          </label>
          <DateRangePicker
            startDate={startDate || null}
            endDate={endDate || null}
            onChange={(range) => {
              setValue("startDate", range.startDate, { shouldValidate: true });
              setValue("endDate", range.endDate, { shouldValidate: true });
            }}
          />
          {errors.startDate && (
            <span className="mt-1 block text-xs font-medium text-rose">
              {errors.startDate.message}
            </span>
          )}
          {errors.endDate && (
            <span className="mt-1 block text-xs font-medium text-rose">
              {errors.endDate.message}
            </span>
          )}
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
            Причина (необов&apos;язково)
          </label>
          <input type="text" placeholder="Відпустка" className={inputClass} {...register("reason")} />
        </div>
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="h-fit rounded-full bg-sage px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
        >
          Додати
        </button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-card bg-sand" />
          ))}
        </div>
      ) : exceptions && exceptions.length > 0 ? (
        <ul className="flex flex-col divide-y divide-sand-dark">
          {exceptions.map((exc) => (
            <li key={exc.id} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-ink">
                {formatExceptionRange(exc)}
                {exc.reason && <span className="text-ink-muted"> · {exc.reason}</span>}
              </span>
              <button
                type="button"
                onClick={() => removeMutation.mutate(exc.id)}
                aria-label="Видалити виняток"
                className="text-ink-muted transition-colors hover:text-rose"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Винятків поки немає</p>
      )}
    </div>
  );
}
