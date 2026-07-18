"use client";

import { useMemo, useState } from "react";
import {
  WEEKDAY_LABELS,
  combineDateAndTime,
  formatWeekRange,
  generateWeekSlots,
  getWeekStart,
  toLocalDateIso,
  type SelectedSlot,
  type SlotServiceType,
} from "../utils/generateFakeSlots";
import { formatSlotRange } from "../utils/formatSlotRange";
import { ServiceTypeDropdown } from "./ServiceTypeDropdown";

const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;

export function SlotPicker({
  psychologistId,
  individualPriceMinor,
  couplePriceMinor,
  coupleSessionDurationMinutes,
  serviceType,
  onServiceTypeChange,
}: {
  psychologistId: string;
  individualPriceMinor: number;
  couplePriceMinor: number | null;
  coupleSessionDurationMinutes: number | null;
  serviceType: SlotServiceType;
  onServiceTypeChange: (type: SlotServiceType) => void;
}) {
  const hasCoupleTherapy = couplePriceMinor !== null;
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const days = useMemo(
    () => generateWeekSlots(weekStart, serviceType),
    [weekStart, serviceType]
  );

  const selectedDayIndex = useMemo(() => {
    if (selectedDayIso) {
      const idx = days.findIndex((d) => toLocalDateIso(d.date) === selectedDayIso);
      if (idx !== -1) return idx;
    }
    const firstFreeIdx = days.findIndex((d) => d.slots.some((s) => !s.isBooked));
    return firstFreeIdx !== -1 ? firstFreeIdx : 0;
  }, [days, selectedDayIso]);

  const selectedDay = days[selectedDayIndex];

  const changeWeek = (delta: number) => {
    setWeekOffset((o) => o + delta);
    setSelectedSlot(null);
    setSelectedDayIso(null);
  };

  const changeServiceType = (type: SlotServiceType) => {
    onServiceTypeChange(type);
    setSelectedSlot(null);
    setSelectedDayIso(null);
  };

  const toggleSlot = (dateIso: string, time: string) => {
    setSelectedSlot((current) =>
      current?.dateIso === dateIso && current.time === time
        ? null
        : { dateIso, time }
    );
  };

  const activeDurationMinutes =
    serviceType === "couple"
      ? (coupleSessionDurationMinutes ?? INDIVIDUAL_SESSION_DURATION_MINUTES)
      : INDIVIDUAL_SESSION_DURATION_MINUTES;
  const activePriceMinor =
    serviceType === "couple" ? (couplePriceMinor ?? individualPriceMinor) : individualPriceMinor;
  const activePriceUah = activePriceMinor / 100;

  const handleBooking = () => {
    // eslint-disable-next-line no-console
    console.log("Booking requested:", {
      psychologistId,
      serviceType,
      slot: selectedSlot,
      durationMinutes: activeDurationMinutes,
      priceMinor: activePriceMinor,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">Оберіть зручний час</h2>

        {hasCoupleTherapy && (
          <div className="w-64 shrink-0">
            <ServiceTypeDropdown serviceType={serviceType} onServiceTypeChange={changeServiceType} />
          </div>
        )}
      </div>

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

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day, i) => {
          const dateIso = toLocalDateIso(day.date);
          const isActive = i === selectedDayIndex;
          return (
            <button
              key={dateIso}
              type="button"
              onClick={() => setSelectedDayIso(dateIso)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-card border-[1.5px] px-4 py-2.5 transition-colors ${
                isActive
                  ? "border-sage bg-sage text-white"
                  : "border-sand-dark text-ink hover:border-sage"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide">
                {WEEKDAY_LABELS[i]}
              </span>
              <span className="text-sm font-semibold">
                {day.date.toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {selectedDay.slots.length === 0 && (
          <p className="text-sm text-ink-muted">Немає вільних слотів цього дня.</p>
        )}
        {selectedDay.slots.map((slot) => {
          const dateIso = toLocalDateIso(selectedDay.date);
          const isSelected =
            selectedSlot?.dateIso === dateIso && selectedSlot.time === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={slot.isBooked}
              onClick={() => toggleSlot(dateIso, slot.time)}
              className={`w-full rounded-full border-[1.5px] px-6 py-4 text-base font-medium transition-colors ${
                slot.isBooked
                  ? "cursor-not-allowed border-sand-dark text-ink-muted/50 line-through"
                  : isSelected
                    ? "border-sage bg-sage text-white"
                    : "border-sand-dark text-ink hover:border-sage"
              }`}
            >
              {formatSlotRange(
                combineDateAndTime(selectedDay.date, slot.time),
                activeDurationMinutes
              )}
            </button>
          );
        })}
      </div>

      {selectedSlot && (
        <p className="text-sm font-medium text-ink">
          Ви обрали:{" "}
          {(() => {
            const [year, month, day] = selectedSlot.dateIso.split("-").map(Number);
            return new Date(year, month - 1, day).toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
            });
          })()}
          , {selectedSlot.time}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-ink-muted">
          {activeDurationMinutes} хв · {activePriceUah} ₴
        </span>
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={handleBooking}
          className="w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-ink-muted"
        >
          Забронювати
        </button>
      </div>
    </div>
  );
}
