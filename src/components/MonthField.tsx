"use client";

import { useEffect, useRef, useState } from "react";
import { MONTHS, SHORT_MONTHS } from "@/lib/calendar";

/**
 * A month-and-year picker, in place of `<input type="month">`.
 *
 * Same complaint as the birthday field: the native control renders in the
 * browser's locale, so this one read "-------- ---- р." on an otherwise English
 * form. It also has the worst support of any date input — Firefox and Safari
 * fall back to a plain text box, where "roughly is fine" turns into guessing
 * what format the box wants.
 *
 * Twelve buttons and a year dropdown instead of a day grid, because the
 * question is "roughly when" and there is no day to choose. Months in the
 * future are disabled: a relationship cannot have started next March.
 *
 * The value stays a `YYYY-MM` string, the same shape the native input produced.
 */

/** How far back the year list goes. Longer than anyone's relationship. */
const EARLIEST_YEARS = 60;

interface Parts {
  year: number;
  month: number;
}

/** `2021-06` → parts. Anything else is treated as empty. */
function parse(value: string): Parts | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return null;

  return { year: Number(match[1]), month };
}

export function MonthField({
  value,
  onChange,
  label = "Select a month",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const selected = parse(value);
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => selected?.year ?? thisYear);
  const wrapper = useRef<HTMLDivElement>(null);

  // Opening lands on the year already chosen — including one restored from the
  // store by a reload — rather than on wherever the dropdown was left.
  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (selected) setYear(selected.year);
    setOpen(true);
  };

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
  for (let y = thisYear; y >= thisYear - EARLIEST_YEARS; y--) years.push(y);

  const pick = (month: number) => {
    onChange(`${year}-${String(month + 1).padStart(2, "0")}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapper}>
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
          {selected ? `${MONTHS[selected.month]} ${selected.year}` : label}
        </span>
        <span aria-hidden className="ml-2 shrink-0 text-slate-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <select
            aria-label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-accent-200"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-1">
            {SHORT_MONTHS.map((month, index) => {
              const isFuture = year === thisYear && index > thisMonth;
              const isSelected =
                selected?.year === year && selected?.month === index;

              return (
                <button
                  key={month}
                  type="button"
                  disabled={isFuture}
                  onClick={() => pick(index)}
                  aria-label={`${MONTHS[index]} ${year}`}
                  aria-current={isSelected ? "date" : undefined}
                  className={`rounded-lg py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-accent-500 font-semibold text-white"
                      : isFuture
                        ? "cursor-not-allowed text-slate-300"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {month}
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
