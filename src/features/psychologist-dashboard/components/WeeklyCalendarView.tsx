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
  INDIVIDUAL_SESSION_DURATION_MINUTES,
  SESSION_BREAK_MINUTES,
} from "@/features/psychologists/utils/availabilityStore";
import {
  calculateAvailableSlots,
  toMinutes,
  toTime,
  type TimeInterval,
} from "@/features/psychologists/utils/calculateAvailableSlots";
import { toggleBlockedSlot } from "../api";
import { useAvailability } from "../hooks/useAvailability";
import { useAvailabilityExceptions } from "../hooks/useAvailabilityExceptions";
import { useBookingStep } from "../hooks/useBookingStep";
import { BLOCKED_SLOTS_QUERY_KEY, useBlockedSlots } from "../hooks/useBlockedSlots";
import { useMyProfile } from "../hooks/useMyProfile";
import { useWeeklyCalendar } from "../hooks/useWeeklyCalendar";
import { SESSION_TYPE_LABELS, WEEKDAYS, WEEKDAY_VALUES } from "../schema";

/* Таймлайн-стрічка: піксель на хвилину, блоки позиціоновані `top`/`height` за
   реальним часом (position: absolute всередині дня-контейнера заданої
   висоти) — а не список окремих прямокутників фіксованого розміру. */
const PX_PER_MINUTE = 1.2;
const DEFAULT_TIMELINE_START_MINUTES = 9 * 60;
const DEFAULT_TIMELINE_END_MINUTES = 18 * 60;
const DAY_COLUMN_WIDTH = 140;
const HEADER_HEIGHT = 40;
const DEFAULT_BOOKING_STEP_MINUTES = 60;

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

type PendingAction = {
  kind: "block" | "unblock";
  dateIso: string;
  interval: TimeInterval;
};

export function WeeklyCalendarView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const weekStart = getWeekStart(weekOffset);

  const { data: availability, isLoading: isAvailabilityLoading } = useAvailability();
  const { data: exceptions } = useAvailabilityExceptions();
  const { data: bookings } = useWeeklyCalendar();
  const { data: blockedSlots } = useBlockedSlots();
  const { data: profile } = useMyProfile();
  const { data: bookingStep } = useBookingStep();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleBlockedSlot,
    onSuccess: (next) => {
      queryClient.setQueryData(BLOCKED_SLOTS_QUERY_KEY, next);
      setPending(null);
    },
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

  const coupleDurationMinutes = profile?.offersCoupleTherapy
    ? (profile.coupleSessionDurationMinutes ?? null)
    : null;
  const controlPointStepMinutes = bookingStep ?? DEFAULT_BOOKING_STEP_MINUTES;
  /* Вільні слоти — незалежні контрольні точки з кроком controlPointStepMinutes
     (варіант Б), а не послідовний цикл: сусідні кандидати того самого типу
     можуть перекриватись у часі (напр. 09:00-09:50 і 09:30-10:20 для 50-хв
     сесії з кроком 30 хв) — це свідомо прийнятий компроміс алгоритму, не
     помилка. Малювати їх блоками на всю реальну тривалість (як бронювання й
     блокування) означало б, що вони візуально накладаються одне на одного.
     Тому кожен вільний слот займає лише свій власний крок сітки — позиція
     (top) все одно за реальним часом початку. */
  const freeSlotMarkerHeight = controlPointStepMinutes * PX_PER_MINUTE;

  const days = WEEKDAY_VALUES.map((weekday, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return { date, dateIso: toLocalDateIso(date), weekday };
  });

  // Спільна вісь часу на весь тиждень (щоб погодинні лінії співпадали по
  // рядках між колонками днів) — від найранішого до найпізнішого робочого
  // вікна серед усіх днів, округлена до цілих годин; дефолт 9:00-18:00, якщо
  // робочих днів узагалі нема.
  const workingWindows = WEEKDAY_VALUES.map((wd) => availability[wd]).filter(
    (w): w is TimeInterval => !!w
  );
  const rawStart = workingWindows.length
    ? Math.min(...workingWindows.map((w) => toMinutes(w.start)))
    : DEFAULT_TIMELINE_START_MINUTES;
  const rawEnd = workingWindows.length
    ? Math.max(...workingWindows.map((w) => toMinutes(w.end)))
    : DEFAULT_TIMELINE_END_MINUTES;
  const timelineStart = Math.floor(rawStart / 60) * 60;
  const timelineEnd = Math.ceil(rawEnd / 60) * 60;
  const timelineHeight = (timelineEnd - timelineStart) * PX_PER_MINUTE;

  const hourMarks: number[] = [];
  for (let m = timelineStart; m <= timelineEnd; m += 60) hourMarks.push(m);

  function topFor(time: string): number {
    return (toMinutes(time) - timelineStart) * PX_PER_MINUTE;
  }

  function heightFor(start: string, end: string): number {
    return Math.max(0, (toMinutes(end) - toMinutes(start)) * PX_PER_MINUTE);
  }

  function requestBlock(dateIso: string, interval: TimeInterval) {
    setPending({ kind: "block", dateIso, interval });
  }

  function requestUnblock(dateIso: string, interval: TimeInterval) {
    setPending({ kind: "unblock", dateIso, interval });
  }

  function confirmPending() {
    if (!pending) return;
    toggleMutation.mutate({
      date: pending.dateIso,
      startTime: pending.interval.start,
      endTime: pending.interval.end,
    });
  }

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
        <div className="flex gap-2" style={{ minWidth: 44 + days.length * (DAY_COLUMN_WIDTH + 8) }}>
          {/* Спільний гутер з підписами годин — вирівняний по тих самих top, що й лінії сітки в колонках днів. */}
          <div className="w-11 shrink-0">
            <div style={{ height: HEADER_HEIGHT }} />
            <div className="relative" style={{ height: timelineHeight }}>
              {hourMarks.map((m) => (
                <span
                  key={m}
                  className="absolute right-1 -translate-y-1/2 text-[10px] text-ink-muted"
                  style={{ top: (m - timelineStart) * PX_PER_MINUTE }}
                >
                  {toTime(m)}
                </span>
              ))}
            </div>
          </div>

          {days.map(({ date, dateIso, weekday }) => {
            const dayLabel = WEEKDAYS.find((d) => d.value === weekday)?.label ?? "";
            const workingWindow = availability[weekday];
            const exception = exceptions?.find(
              (e) => dateIso >= e.startDate && dateIso <= e.endDate
            );

            const dayBookings = (bookings ?? []).filter((b) => b.dayOfWeek === weekday);
            const dayBlocked = (blockedSlots ?? []).filter((b) => b.date === dateIso);

            const busyIntervals: TimeInterval[] = [
              ...dayBookings.map((b) => ({
                start: b.startTime,
                end: addMinutesToTime(b.startTime, b.durationMinutes),
              })),
              ...dayBlocked.map((b) => ({ start: b.startTime, end: b.endTime })),
            ];

            const freeSlots =
              workingWindow && !exception
                ? calculateAvailableSlots({
                    workingWindow,
                    busyIntervals,
                    individualDurationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
                    coupleDurationMinutes,
                    breakMinutes: SESSION_BREAK_MINUTES,
                    controlPointStepMinutes,
                  })
                : { individual: [], couple: [] };

            const hasCoupleLane = coupleDurationMinutes != null;

            return (
              <div
                key={dateIso}
                className="shrink-0 rounded-card border-[1.5px] border-sand-dark bg-white p-2"
                style={{ width: DAY_COLUMN_WIDTH }}
              >
                <div style={{ height: HEADER_HEIGHT }} className="flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-ink">{dayLabel}</p>
                  <p className="text-xs text-ink-muted">
                    {date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {!workingWindow ? (
                  <p className="py-4 text-center text-xs text-ink-muted">Вихідний</p>
                ) : exception ? (
                  <p className="py-4 text-center text-xs text-rose">
                    {exception.reason ?? "Недоступно"}
                  </p>
                ) : (
                  <div className="relative" style={{ height: timelineHeight }}>
                    {/* Фонова погодинна сітка */}
                    {hourMarks.map((m) => (
                      <div
                        key={m}
                        className="absolute inset-x-0 border-t border-sand-dark/50"
                        style={{ top: (m - timelineStart) * PX_PER_MINUTE }}
                      />
                    ))}

                    {/* Заброньовані сесії — лише перегляд, без дій */}
                    {dayBookings.map((booking) => {
                      const end = addMinutesToTime(booking.startTime, booking.durationMinutes);
                      const h = heightFor(booking.startTime, end);
                      return (
                        <div
                          key={booking.id}
                          style={{ top: topFor(booking.startTime), height: h }}
                          className="absolute inset-x-0.5 flex flex-col justify-center overflow-hidden rounded-[8px] bg-sage-light px-1.5 py-1 leading-tight"
                        >
                          <p className="truncate text-[10px] font-semibold text-sage">
                            {booking.startTime}–{end}
                          </p>
                          <p className="truncate text-[10px] text-ink">{booking.clientName}</p>
                          {h > 38 && (
                            <p className="truncate text-[9px] text-ink-muted">
                              {SESSION_TYPE_LABELS[booking.type]}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Заблоковані інтервали — клік розблоковує */}
                    {dayBlocked.map((blocked) => (
                      <button
                        key={blocked.id}
                        type="button"
                        onClick={() =>
                          requestUnblock(dateIso, { start: blocked.startTime, end: blocked.endTime })
                        }
                        style={{
                          top: topFor(blocked.startTime),
                          height: heightFor(blocked.startTime, blocked.endTime),
                        }}
                        className="absolute inset-x-0.5 flex flex-col items-center justify-center overflow-hidden rounded-[8px] border-[1.5px] border-rose bg-rose/15 px-1 leading-tight text-rose transition-colors hover:bg-rose/25"
                      >
                        <span className="truncate text-[10px] font-semibold">
                          {blocked.startTime}–{blocked.endTime}
                        </span>
                        <span className="truncate text-[9px]">заблоковано</span>
                      </button>
                    ))}

                    {/* Вільні індивідуальні — біла заливка, сіра обводка */}
                    {freeSlots.individual.map((slot) => (
                      <button
                        key={`ind-${slot.start}`}
                        type="button"
                        onClick={() => requestBlock(dateIso, slot)}
                        style={{
                          top: topFor(slot.start),
                          height: freeSlotMarkerHeight,
                          left: 2,
                          right: hasCoupleLane ? "51%" : 2,
                        }}
                        className="absolute flex flex-col items-center justify-center gap-px overflow-hidden rounded-[8px] border-[1.5px] border-sand-dark bg-white px-0.5 text-center text-ink-muted transition-colors hover:border-sage hover:text-sage"
                      >
                        <span className="text-[9px] leading-none font-medium">{slot.start}</span>
                        <span className="text-[8px] leading-none opacity-70">{slot.end}</span>
                      </button>
                    ))}

                    {/* Вільні парні — білий фон (без заливки), лише sage-обводка відрізняє від індивідуальних */}
                    {hasCoupleLane &&
                      freeSlots.couple.map((slot) => (
                        <button
                          key={`couple-${slot.start}`}
                          type="button"
                          onClick={() => requestBlock(dateIso, slot)}
                          style={{
                            top: topFor(slot.start),
                            height: freeSlotMarkerHeight,
                            left: "51%",
                            right: 2,
                          }}
                          className="absolute flex flex-col items-center justify-center gap-px overflow-hidden rounded-[8px] border-[1.5px] border-sage bg-white px-0.5 text-center text-sage transition-colors hover:bg-sage-light/40"
                        >
                          <span className="text-[9px] leading-none font-medium">{slot.start}</span>
                          <span className="text-[8px] leading-none opacity-70">{slot.end}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Клікніть на вільний слот, щоб заблокувати його для клієнтів — білий з сірою обводкою
        для індивідуальних, sage для парних. Заброньовані сесії (зелені) — лише перегляд,
        заблоковані (червоні) — клікніть, щоб розблокувати.
      </p>

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPending(null)}
        >
          <div
            className="w-full max-w-xs rounded-card bg-white p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-ink">
              {pending.kind === "block" ? "Заблокувати" : "Розблокувати"}{" "}
              <span className="font-semibold">
                {pending.interval.start}–{pending.interval.end}
              </span>
              ?
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-sage hover:text-sage"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={confirmPending}
                disabled={toggleMutation.isPending}
                className="rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-ink-muted"
              >
                {toggleMutation.isPending
                  ? "Зачекайте..."
                  : pending.kind === "block"
                    ? "Так, заблокувати"
                    : "Так, розблокувати"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
