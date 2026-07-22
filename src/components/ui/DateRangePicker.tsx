"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const MONTH_LABELS = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

function CalendarIcon({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

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

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Клітинки місяця (з порожніми "хвостами"), тиждень починається з понеділка. */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** "2026-08-15".."2026-08-25" → "15 – 25 серпня 2026"; один день → повна дата. */
function formatRangeLabel(startIso: string, endIso: string): string {
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);

  if (startIso === endIso) return `${sd} ${MONTH_LABELS[sm - 1]} ${sy}`;
  if (sy === ey && sm === em) return `${sd} – ${ed} ${MONTH_LABELS[em - 1]} ${ey}`;
  if (sy === ey) return `${sd} ${MONTH_LABELS[sm - 1]} – ${ed} ${MONTH_LABELS[em - 1]} ${ey}`;
  return `${sd} ${MONTH_LABELS[sm - 1]} ${sy} – ${ed} ${MONTH_LABELS[em - 1]} ${ey}`;
}

/**
 * Кастомний date-range-picker: міні-календар у поповері, клік на початкову
 * дату потім на кінцеву підсвічує весь діапазон. Один клік = діапазон з
 * одного дня (startDate === endDate).
 */
export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = "",
}: {
  startDate: string | null;
  endDate: string | null;
  onChange: (range: { startDate: string; endDate: string }) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const initialView = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setOpen(false);
    setPendingStart(null);
  });

  // Форма ззовні викликала reset() — синхронізуємо внутрішній стан вибору.
  useEffect(() => {
    if (!startDate && !endDate) setPendingStart(null);
  }, [startDate, endDate]);

  const cells = buildMonthGrid(viewYear, viewMonth);

  function handleDayClick(date: Date) {
    const iso = toIso(date);
    if (pendingStart === null) {
      setPendingStart(iso);
      onChange({ startDate: iso, endDate: iso });
      return;
    }
    const start = iso < pendingStart ? iso : pendingStart;
    const end = iso < pendingStart ? pendingStart : iso;
    onChange({ startDate: start, endDate: end });
    setPendingStart(null);
  }

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const buttonLabel =
    startDate && endDate ? formatRangeLabel(startDate, endDate) : "Оберіть дати";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] bg-sand px-4 py-3 text-left text-sm outline-none transition-colors ${
          open ? "border-sage" : "border-sand-dark"
        }`}
      >
        <span className={startDate ? "text-ink" : "text-ink-muted"}>{buttonLabel}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-[14px] border-[1.5px] border-sand-dark bg-white p-4 shadow-lg">
          {startDate && endDate && (
            <p className="mb-3 text-center text-sm font-medium text-ink">
              {formatRangeLabel(startDate, endDate)}
            </p>
          )}

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="Попередній місяць"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand"
            >
              <ChevronIcon direction="left" className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-ink">
              {MONTH_LABELS[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Наступний місяць"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand"
            >
              <ChevronIcon direction="right" className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-muted">
            {WEEKDAY_LABELS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <span key={i} />;
              const iso = toIso(date);
              const isStart = iso === startDate;
              const isEnd = iso === endDate;
              const inRange =
                Boolean(startDate && endDate) && iso > (startDate ?? "") && iso < (endDate ?? "");

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                    isStart || isEnd
                      ? "bg-sage font-medium text-white"
                      : inRange
                        ? "bg-sage-light text-sage"
                        : "text-ink hover:bg-sand"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
