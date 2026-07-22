"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function generateTimeOptions(stepMinutes: number): string[] {
  const options: string[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    options.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return options;
}

/**
 * Кастомний time-picker: dropdown-список часу з кроком stepMinutes замість
 * нативного input[type=time] — швидше гортати, стилізовано під токени проєкту.
 */
export function TimePicker({
  value,
  onChange,
  stepMinutes = 15,
  label,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  stepMinutes?: number;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const options = generateTimeOptions(stepMinutes);

  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] bg-sand px-4 py-3 text-sm outline-none transition-colors ${
          open ? "border-sage" : "border-sand-dark"
        }`}
      >
        <span className="text-ink">{value || "--:--"}</span>
        <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-20 mt-2 max-h-56 w-full min-w-[120px] overflow-y-auto rounded-[14px] border-[1.5px] border-sand-dark bg-white p-1.5 shadow-lg"
        >
          {options.map((time) => {
            const isActive = time === value;
            return (
              <button
                key={time}
                type="button"
                data-active={isActive}
                onClick={() => {
                  onChange(time);
                  setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive ? "bg-sage-light font-medium text-sage" : "text-ink hover:bg-sand"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
