"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  formatWeekRange,
  getWeekStart,
  toLocalDateIso,
} from "@/features/psychologists/utils/generateFakeSlots";
import {
  addMinutesToTime,
  enumerateCycleTimes,
  INDIVIDUAL_SESSION_DURATION_MINUTES,
  SESSION_BREAK_MINUTES,
} from "@/features/psychologists/utils/availabilityStore";
import { toggleBlockedSlot } from "../api";
import { useAvailability } from "../hooks/useAvailability";
import { useAvailabilityExceptions } from "../hooks/useAvailabilityExceptions";
import { BLOCKED_SLOTS_QUERY_KEY, useBlockedSlots } from "../hooks/useBlockedSlots";
import { useWeeklyCalendar } from "../hooks/useWeeklyCalendar";
import { SESSION_TYPE_LABELS, WEEKDAYS, WEEKDAY_VALUES } from "../schema";

function ChevronIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export function WeeklyCalendarView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getWeekStart(weekOffset);

  const { data: availability, isLoading: isAvailabilityLoading } = useAvailability();
  const { data: exceptions } = useAvailabilityExceptions();
  const { data: bookings } = useWeeklyCalendar();
  const { data: blockedSlots } = useBlockedSlots();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleBlockedSlot,
    onSuccess: (next) => queryClient.setQueryData(BLOCKED_SLOTS_QUERY_KEY, next),
  });

  if (isAvailabilityLoading || !availability) {
    return (
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-card bg-sand" />
        ))}
      </div>
    );
  }

  const days = WEEKDAY_VALUES.map((weekday, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return { date, dateIso: toLocalDateIso(date), weekday };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          aria-label="Попередній тиждень"
          className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sand-dark text-ink-muted transition-colors hover:border-sage hover:text-sage"
        >
          <ChevronIcon direction="left" className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-ink">{formatWeekRange(weekStart)}</p>
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o + 1)}
          aria-label="Наступний тиждень"
          className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sand-dark text-ink-muted transition-colors hover:border-sage hover:text-sage"
        >
          <ChevronIcon direction="right" className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {days.map(({ date, dateIso, weekday }) => {
            const dayLabel = WEEKDAYS.find((d) => d.value === weekday)?.label ?? "";
            const isWorkingDay = availability.workingDays.includes(weekday);
            const exception = exceptions?.find(
              (e) => dateIso >= e.startDate && dateIso <= e.endDate
            );
            const dayBookings = (bookings ?? []).filter((b) => b.dayOfWeek === weekday);
            // Сітка завжди на кроці індивідуального циклу (60 хв) — блокування
            // рахується перекриттям часу, тож коректно виключає і парні слоти
            // незалежно від їх (змінної) тривалості.
            const times =
              isWorkingDay && !exception
                ? enumerateCycleTimes(
                    availability,
                    INDIVIDUAL_SESSION_DURATION_MINUTES + SESSION_BREAK_MINUTES
                  )
                : [];

            return (
              <div
                key={dateIso}
                className="flex flex-col gap-2 rounded-card border-[1.5px] border-sand-dark bg-white p-3"
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink">{dayLabel}</p>
                  <p className="text-xs text-ink-muted">
                    {date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {!isWorkingDay ? (
                  <p className="mt-2 text-center text-xs text-ink-muted">Вихідний</p>
                ) : exception ? (
                  <p className="mt-2 text-center text-xs text-rose">
                    {exception.reason ?? "Недоступно"}
                  </p>
                ) : times.length === 0 ? (
                  <p className="mt-2 text-center text-xs text-ink-muted">—</p>
                ) : (
                  times.map((time) => {
                    const booking = dayBookings.find((b) => b.startTime === time);
                    const isBlocked = (blockedSlots ?? []).some(
                      (b) => b.date === dateIso && b.startTime === time
                    );

                    if (booking) {
                      return (
                        <div key={time} className="rounded-[10px] bg-sage-light p-2.5">
                          <p className="text-xs font-semibold text-sage">{time}</p>
                          <p className="truncate text-xs text-ink">{booking.clientName}</p>
                          <p className="text-[10px] text-ink-muted">
                            {SESSION_TYPE_LABELS[booking.type]}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() =>
                          toggleMutation.mutate({
                            date: dateIso,
                            startTime: time,
                            endTime: addMinutesToTime(time, INDIVIDUAL_SESSION_DURATION_MINUTES),
                          })
                        }
                        className={`rounded-[10px] border-[1.5px] p-2 text-center text-xs font-medium transition-colors ${
                          isBlocked
                            ? "border-rose bg-rose/10 text-rose"
                            : "border-sand-dark text-ink-muted hover:border-sage hover:text-sage"
                        }`}
                      >
                        {time}
                        {isBlocked && <span className="block text-[10px]">заблоковано</span>}
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Клікніть на вільний слот, щоб заблокувати його для клієнтів. Заброньовані сесії
        (зелені) тут лише для перегляду.
      </p>
    </div>
  );
}
