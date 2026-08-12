"use client";

import { useEffect, useRef, useState } from "react";
import { MONTHS, SHORT_MONTHS } from "@/lib/calendar";

/**
 * A birthday picker, in place of `<input type="date">`.
 *
 * The native control has two problems here, and neither is styling. It renders
 * in the *browser's* locale, so an English form was handing people a calendar
 * headed "серпень 2026 р." (see calendar.ts) — and it opens on the current
 * month, which is thirty years and about four hundred taps from a birthday.
 * This one opens on a plausible birth year and puts the year in a dropdown, so
 * picking 1992 is one gesture rather than a scroll.
 *
 * The value stays a `YYYY-MM-DD` string, the same shape the native input
 * produced, so nothing downstream of the form changes.
 */

/** Sunday first — this form is written for a US audience. */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Who this product is for, expressed as a year range: the oldest plausible
 * birthday and the youngest age the terms allow.
 */
const OLDEST_YEARS = 100;
const YOUNGEST_YEARS = 16;
/** Where the calendar opens when there's nothing to open on yet. */
const DEFAULT_AGE = 30;

interface Parts {
  year: number;
  month: number;
  day: number;
}

/** `2026-08-11` → parts. Anything else is treated as empty. */
function parse(value: string): Parts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;

  return { year, month, day };
}

function format(parts: Parts): string {
  const month = String(parts.month + 1).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one, leap years included.
  return new Date(year, month + 1, 0).getDate();
}

export function BirthdayField({
  value,
  onChange,
  accent,
  align = "left",
  label = "Birthday",
}: {
  value: string;
  onChange: (value: string) => void;
  accent: "p1" | "p2";
  /**
   * Which edge the popover hangs from. The two partners sit in a two-column
   * grid and the popover is wider than one column, so the right-hand field has
   * to open leftwards — anchored left on a 375px screen it ran off the edge and
   * gave the whole page a horizontal scrollbar.
   */
  align?: "left" | "right";
  label?: string;
}) {
  const selected = parse(value);
  const thisYear = new Date().getFullYear();
  const latestYear = thisYear - YOUNGEST_YEARS;
  const earliestYear = thisYear - OLDEST_YEARS;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => ({
    year: selected?.year ?? thisYear - DEFAULT_AGE,
    month: selected?.month ?? 0,
  }));
  const wrapper = useRef<HTMLDivElement>(null);

  // Opening lands on the date already chosen — including one restored from the
  // store by a reload — rather than on wherever the dropdowns were left.
  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (selected) setView({ year: selected.year, month: selected.month });
    setOpen(true);
  };

  // Outside click and Escape, bound only while the popover is up.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const years: number[] = [];
  for (let year = latestYear; year >= earliestYear; year--) years.push(year);

  const total = daysInMonth(view.year, view.month);
  const leadingBlanks = new Date(view.year, view.month, 1).getDay();

  const pick = (day: number) => {
    onChange(format({ year: view.year, month: view.month, day }));
    setOpen(false);
  };

  const selectedStyles =
    accent === "p1"
      ? "bg-[var(--color-p1)] text-white"
      : "bg-[var(--color-p2)] text-white";

  return (
    <div className="relative" ref={wrapper}>
      <span className="mb-1 block text-xs font-semibold text-ink-500">{label}</span>

      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`field flex items-center justify-between text-left ${
          selected ? "" : "text-slate-400"
        }`}
      >
        <span className="truncate whitespace-nowrap">
          {selected
            ? `${SHORT_MONTHS[selected.month]} ${selected.day}, ${selected.year}`
            : "Select a date"}
        </span>
        <span aria-hidden className="ml-2 shrink-0 text-slate-400">
          ▾
        </span>
      </button>

      {open && (
        // Wider than the field it hangs off — the two partners sit in a narrow
        // two-column grid, and a seven-day week does not fit in one column.
        <div
          role="dialog"
          aria-label={label}
          className={`absolute top-full z-20 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-2 flex gap-2">
            <select
              aria-label="Month"
              value={view.month}
              onChange={(e) =>
                setView((v) => ({ ...v, month: Number(e.target.value) }))
              }
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-accent-200"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={view.year}
              onChange={(e) =>
                setView((v) => ({ ...v, year: Number(e.target.value) }))
              }
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-accent-200"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((day, index) => (
              <span
                key={index}
                className="py-1 text-[11px] font-semibold text-slate-400"
              >
                {day}
              </span>
            ))}

            {Array.from({ length: leadingBlanks }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}

            {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
              const isSelected =
                selected?.year === view.year &&
                selected?.month === view.month &&
                selected?.day === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pick(day)}
                  aria-label={`${MONTHS[view.month]} ${day}, ${view.year}`}
                  aria-current={isSelected ? "date" : undefined}
                  className={`rounded-lg py-1.5 text-sm transition-colors ${
                    isSelected
                      ? `font-semibold ${selectedStyles}`
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full rounded-lg py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
