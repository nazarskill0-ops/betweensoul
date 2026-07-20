"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

function UserIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function AuthMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
      >
        <UserIcon className="h-4 w-4 shrink-0" />
        Увійти
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 divide-y divide-sand-dark overflow-hidden rounded-[14px] border border-sand-dark bg-white shadow-lg">
          <Link
            href="/login?role=client"
            onClick={() => setOpen(false)}
            className="block px-4 py-3.5 text-sm text-ink transition-colors hover:bg-sage-light"
          >
            Я клієнт
          </Link>
          <Link
            href="/login?role=therapist"
            onClick={() => setOpen(false)}
            className="block px-4 py-3.5 text-sm text-ink transition-colors hover:bg-sage-light"
          >
            Я психолог
          </Link>
        </div>
      )}
    </div>
  );
}
