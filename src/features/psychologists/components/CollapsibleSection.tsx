"use client";

import { useState, type ReactNode } from "react";

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

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  bare = false,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  /** When true, skip the own card border/rounding — used inside a shared grouped container. */
  bare?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={bare ? "" : "rounded-card border-[1.5px] border-sand-dark bg-white"}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span
              className={`flex shrink-0 items-center justify-center rounded-full ${
                bare ? "h-8 w-8 bg-sage/10" : "h-9 w-9 bg-sage-light"
              }`}
            >
              {icon}
            </span>
          )}
          <h2 className={`font-display text-xl text-ink ${bare ? "font-bold" : ""}`}>{title}</h2>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-ink-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && <div className="flex flex-col gap-4 px-5 pb-5">{children}</div>}
    </div>
  );
}
