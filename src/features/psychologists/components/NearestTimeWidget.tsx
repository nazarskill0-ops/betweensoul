"use client";

import { useEffect, useRef, useState } from "react";
import { combineDateAndTime, type DayColumn, type SlotServiceType } from "../utils/generateFakeSlots";
import { formatRelativeDate, isToday } from "../utils/formatRelativeDate";
import { formatSlotRange } from "../utils/formatSlotRange";
import { CalendarIcon } from "./icons";

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const SERVICE_TYPE_OPTIONS: { value: SlotServiceType; label: string }[] = [
  { value: "individual", label: "Персональна терапія" },
  { value: "couple", label: "Парна терапія" },
];

export function NearestTimeWidget({
  nearestDay,
  selectedTime,
  onSelectTime,
  durationMinutes,
  hasCoupleTherapy,
  serviceType,
  onServiceTypeChange,
}: {
  nearestDay: DayColumn | null;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  durationMinutes: number;
  hasCoupleTherapy: boolean;
  serviceType: SlotServiceType;
  onServiceTypeChange: (type: SlotServiceType) => void;
}) {
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const serviceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isServiceMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (serviceMenuRef.current && !serviceMenuRef.current.contains(event.target as Node)) {
        setIsServiceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isServiceMenuOpen]);

  if (!nearestDay) return null;

  const freeSlots = nearestDay.slots.filter((s) => !s.isBooked).slice(0, 2);
  if (freeSlots.length === 0) return null;

  const isSingleSlotToday = isToday(nearestDay.date) && freeSlots.length === 1;
  const activeServiceLabel = SERVICE_TYPE_OPTIONS.find((o) => o.value === serviceType)?.label;

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-4 rounded-card border border-sand-dark p-4">
      {hasCoupleTherapy && (
        <div className="relative" ref={serviceMenuRef}>
          <button
            type="button"
            onClick={() => setIsServiceMenuOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-card border border-sand-dark bg-white px-3 py-2 text-sm font-medium text-ink"
          >
            {activeServiceLabel}
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${
                isServiceMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isServiceMenuOpen && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-card border border-sand-dark bg-white shadow-sm">
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onServiceTypeChange(option.value);
                    setIsServiceMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    option.value === serviceType
                      ? "bg-sage-light text-ink"
                      : "text-ink hover:bg-sand"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="block text-center text-sm text-ink-muted">Найближчий час</span>
        <span className="block text-center font-sans text-xl font-bold text-ink">
          {formatRelativeDate(nearestDay.date)}
        </span>
      </div>

      <div className={isSingleSlotToday ? "flex justify-center" : "flex flex-wrap justify-center gap-2"}>
        {freeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectTime(isSelected ? null : slot.time)}
              className={`rounded-full border-[1.5px] px-6 py-4 text-base font-medium transition-colors ${
                isSelected
                  ? "border-sage bg-sage text-white"
                  : "border-sand-dark bg-white text-ink hover:border-sage"
              }`}
            >
              {formatSlotRange(combineDateAndTime(nearestDay.date, slot.time), durationMinutes)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={scrollToBooking}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-sage transition-colors hover:text-sage/80"
      >
        Інші варіанти
        <CalendarIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
