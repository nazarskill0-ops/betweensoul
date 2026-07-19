"use client";

import { useEffect, useRef, useState } from "react";
import type { SlotServiceType } from "../utils/generateFakeSlots";

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
  { value: "individual", label: "Індивідуальна терапія" },
  { value: "couple", label: "Парна терапія" },
];

export function ServiceTypeDropdown({
  serviceType,
  onServiceTypeChange,
}: {
  serviceType: SlotServiceType;
  onServiceTypeChange: (type: SlotServiceType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeLabel = SERVICE_TYPE_OPTIONS.find((o) => o.value === serviceType)?.label;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-card border border-sand-dark bg-white px-3 py-2 text-sm font-medium text-ink"
      >
        {activeLabel}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-card border border-sand-dark bg-white shadow-sm">
          {SERVICE_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onServiceTypeChange(option.value);
                setIsOpen(false);
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
  );
}
