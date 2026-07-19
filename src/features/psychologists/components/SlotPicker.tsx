"use client";

import { useMemo, useState } from "react";
import {
  combineDateAndTime,
  generateUpcomingSlots,
  toLocalDateIso,
  type SelectedSlot,
  type SlotServiceType,
} from "../utils/generateFakeSlots";
import { formatSlotRange } from "../utils/formatSlotRange";
import { ServiceTypeDropdown } from "./ServiceTypeDropdown";

const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;
const INITIAL_VISIBLE_DAYS = 3;
const LOAD_MORE_DAYS_STEP = 3;

type DayGroup = { dateIso: string; date: Date; times: string[] };

/** Заголовок групи-дня у списку слотів: "20 липня, понеділок". */
function formatDayGroupHeading(date: Date): string {
  const dayMonth = date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  const weekday = date.toLocaleDateString("uk-UA", { weekday: "long" });
  return `${dayMonth}, ${weekday}`;
}

/** Дата в підтвердженні обраного слоту: "20 липня" (без дня тижня). */
function formatSelectedDateLabel(date: Date): string {
  return date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
}

function groupSlotsByDay(slots: { date: Date; time: string }[]): DayGroup[] {
  const groups: DayGroup[] = [];
  const indexByDateIso = new Map<string, number>();

  for (const slot of slots) {
    const dateIso = toLocalDateIso(slot.date);
    const existingIndex = indexByDateIso.get(dateIso);
    if (existingIndex === undefined) {
      indexByDateIso.set(dateIso, groups.length);
      groups.push({ dateIso, date: slot.date, times: [slot.time] });
    } else {
      groups[existingIndex].times.push(slot.time);
    }
  }

  return groups;
}

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
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);
  const [visibleDayCount, setVisibleDayCount] = useState(INITIAL_VISIBLE_DAYS);

  const upcomingSlots = useMemo(
    () => generateUpcomingSlots(serviceType),
    [serviceType]
  );
  const dayGroups = useMemo(() => groupSlotsByDay(upcomingSlots), [upcomingSlots]);
  const visibleDayGroups = dayGroups.slice(0, visibleDayCount);
  const hasMoreDays = dayGroups.length > visibleDayCount;

  const changeServiceType = (type: SlotServiceType) => {
    onServiceTypeChange(type);
    setSelectedSlot(null);
    setVisibleDayCount(INITIAL_VISIBLE_DAYS);
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
    <div className="flex flex-col gap-4 rounded-card bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">Оберіть зручний час</h2>

        {hasCoupleTherapy && (
          <div className="w-64 shrink-0">
            <ServiceTypeDropdown serviceType={serviceType} onServiceTypeChange={changeServiceType} />
          </div>
        )}
      </div>

      {dayGroups.length === 0 ? (
        <p className="text-sm text-ink-muted">Немає доступних слотів найближчим часом.</p>
      ) : (
        <>
          <div className="flex flex-col gap-5">
            {visibleDayGroups.map((group) => (
              <div key={group.dateIso} className="flex flex-col gap-2">
                <h3 className="font-display text-base font-semibold text-ink">
                  {formatDayGroupHeading(group.date)}
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.times.map((time) => {
                    const isSelected =
                      selectedSlot?.dateIso === group.dateIso && selectedSlot.time === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleSlot(group.dateIso, time)}
                        className={`cursor-pointer rounded-lg border-[1.5px] px-3 py-2.5 text-center text-sm font-normal transition-all duration-200 hover:scale-[1.04] ${
                          isSelected
                            ? "border-sage bg-sage text-white"
                            : "border-sand-dark text-ink hover:border-sage"
                        }`}
                      >
                        {formatSlotRange(combineDateAndTime(group.date, time), activeDurationMinutes)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {(hasMoreDays || visibleDayCount > INITIAL_VISIBLE_DAYS) && (
            <div className="flex items-center gap-4">
              {hasMoreDays && (
                <button
                  type="button"
                  onClick={() => setVisibleDayCount((c) => c + LOAD_MORE_DAYS_STEP)}
                  className="w-fit text-sm font-medium text-sage transition-colors hover:text-sage/80"
                >
                  Показати більше дат
                </button>
              )}
              {visibleDayCount > INITIAL_VISIBLE_DAYS && (
                <button
                  type="button"
                  onClick={() => setVisibleDayCount(INITIAL_VISIBLE_DAYS)}
                  className="w-fit text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Показати менше
                </button>
              )}
            </div>
          )}
        </>
      )}

      {selectedSlot && (
        <div className="flex flex-col gap-0.5 text-sm font-medium text-ink">
          <p>
            Ви обрали: {serviceType === "couple" ? "Парна сесія" : "Індивідуальна сесія"} ·{" "}
            {activePriceUah} ₴
          </p>
          <p className="text-ink-muted">
            {(() => {
              const [year, month, day] = selectedSlot.dateIso.split("-").map(Number);
              const date = new Date(year, month - 1, day);
              return `${formatSelectedDateLabel(date)} ${formatSlotRange(
                combineDateAndTime(date, selectedSlot.time),
                activeDurationMinutes
              )}`;
            })()}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
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
