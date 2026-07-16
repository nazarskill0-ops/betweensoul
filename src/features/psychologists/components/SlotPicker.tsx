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

const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;

export function SlotPicker({
  psychologistId,
  individualPriceMinor,
  couplePriceMinor,
  coupleSessionDurationMinutes,
}: {
  psychologistId: string;
  individualPriceMinor: number;
  couplePriceMinor: number | null;
  coupleSessionDurationMinutes: number | null;
}) {
  const hasCoupleTherapy = couplePriceMinor !== null;
  const [serviceType, setServiceType] = useState<SlotServiceType>("individual");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const days = useMemo(
    () => generateWeekSlots(weekStart, serviceType),
    [weekStart, serviceType]
  );

  const changeWeek = (delta: number) => {
    setWeekOffset((o) => o + delta);
    setSelectedSlot(null);
  };

  const changeServiceType = (type: SlotServiceType) => {
    setServiceType(type);
    setSelectedSlot(null);
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
      <h2 className="font-display text-2xl text-ink">Оберіть зручний час</h2>

      {hasCoupleTherapy && (
        <div className="flex w-fit gap-2 rounded-full border-[1.5px] border-sand-dark p-1">
          <button
            type="button"
            onClick={() => changeServiceType("individual")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              serviceType === "individual"
                ? "bg-sage text-white"
                : "text-ink hover:text-sage"
            }`}
          >
            Особиста терапія
          </button>
          <button
            type="button"
            onClick={() => changeServiceType("couple")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              serviceType === "couple"
                ? "bg-sage text-white"
                : "text-ink hover:text-sage"
            }`}
          >
            Парна терапія
          </button>
        </div>
      )}

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
          const dateIso = toLocalDateIso(day.date);
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
                      {formatSlotRange(
                        combineDateAndTime(day.date, slot.time),
                        activeDurationMinutes
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
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
