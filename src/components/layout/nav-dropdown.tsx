"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

type NavDropdownProps = {
  label: string;
  items: readonly string[];
  paramName: "service" | "specializations";
  columns?: 1 | 2;
};

function ChevronIcon({ className }: { className?: string }) {
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

export function NavDropdown({ label, items, paramName, columns = 1 }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-sage"
      >
        {label}
        <ChevronIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // pt-2 (not mt-2) keeps the gap to the button inside this element's own
        // hit box, so moving the cursor through it doesn't trigger mouseleave.
        <div className={`absolute left-0 top-full pt-2 ${columns === 2 ? "w-[520px]" : "w-64"}`}>
          <div className="overflow-hidden rounded-[14px] border border-sand-dark bg-white py-1 shadow-lg">
            <div className={columns === 2 ? "grid grid-cols-2" : ""}>
              {items.map((item) => (
                <Link
                  key={item}
                  href={`/catalog?${paramName}=${encodeURIComponent(item)}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-sage-light"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
