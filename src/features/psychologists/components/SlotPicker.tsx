"use client";

import { useMemo, useState } from "react";

const TIME_SLOTS_POOL = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30",
];

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

type DaySlot = { time: string; isBooked: boolean };
type DayColumn = { date: Date; slots: DaySlot[] };
type SelectedSlot = { dateIso: string; time: string } | null;

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getWeekStart(offset: number): Date {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function generateWeekSlots(weekStart: Date): DayColumn[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const seed = date.toISOString().slice(0, 10);
    const rand = seededRandom(seed);
    const count = 3 + Math.floor(rand() * 3); // 3-5
    const times = shuffle(TIME_SLOTS_POOL, rand)
      .slice(0, count)
      .sort();
    const slots: DaySlot[] = times.map((time) => ({
      time,
      isBooked: rand() < 0.3,
    }));
    return { date, slots };
  });
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startStr = weekStart.toLocaleDateString(
    "uk-UA",
    sameMonth ? { day: "numeric" } : { day: "numeric", month: "long" }
  );
  const endStr = weekEnd.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
  return `${startStr} – ${endStr}`;
}

export function SlotPicker({ psychologistId }: { psychologistId: string }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const days = useMemo(() => generateWeekSlots(weekStart), [weekStart]);

  const changeWeek = (delta: number) => {
    setWeekOffset((o) => o + delta);
    setSelectedSlot(null);
  };

  const toggleSlot = (dateIso: string, time: string) => {
    setSelectedSlot((current) =>
      current?.dateIso === dateIso && current.time === time
        ? null
        : { dateIso, time }
    );
  };

  const handleBooking = () => {
    // eslint-disable-next-line no-console
    console.log("Booking requested:", { psychologistId, slot: selectedSlot });
  };

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-2xl text-ink">Оберіть зручний час</h2>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => changeWeek(-1)}
          className="rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink transition-colors hover:border-sage"
        >
          ← Попередній тиждень
        </button>
        <span className="text-sm font-medium text-ink-muted">
          {formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={() => changeWeek(1)}
          className="rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink transition-colors hover:border-sage"
        >
          Наступний тиждень →
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {days.map((day, i) => {
          const dateIso = day.date.toISOString().slice(0, 10);
          return (
            <div
              key={dateIso}
              className="flex w-36 shrink-0 flex-col gap-2 rounded-card border-[1.5px] border-sand-dark p-3"
            >
              <div className="text-center">
                <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {WEEKDAY_LABELS[i]}
                </div>
                <div className="text-sm font-semibold text-ink">
                  {day.date.toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {day.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.dateIso === dateIso &&
                    selectedSlot.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => toggleSlot(dateIso, slot.time)}
                      className={`rounded-full border-[1.5px] px-2 py-1.5 text-sm transition-colors ${
                        slot.isBooked
                          ? "cursor-not-allowed border-sand-dark text-ink-muted/50 line-through"
                          : isSelected
                            ? "border-sage bg-sage text-white"
                            : "border-sand-dark text-ink hover:border-sage"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedSlot}
        onClick={handleBooking}
        className="w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-ink-muted"
      >
        Забронювати
      </button>
    </div>
  );
}
