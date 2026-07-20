"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { TOPIC_GROUPS } from "@/features/psychologists/schema";

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

export function TopicsMegaMenu() {
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
        Теми
        <ChevronIcon
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // pt-2 (not mt-2) keeps the gap to the button inside this element's own
        // hit box, so moving the cursor through it doesn't trigger mouseleave.
        <div className="absolute left-1/2 top-full w-[760px] -translate-x-1/2 pt-2">
          <div className="rounded-[14px] border border-sand-dark bg-white p-[29px] shadow-lg">
            <div className="grid grid-cols-4 gap-[29px]">
              {TOPIC_GROUPS.map((group) => (
                <div key={group.group}>
                  <div className="mb-[10px] text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {group.group}
                  </div>
                  <ul className="space-y-[7px]">
                    {group.topics.map((topic) => (
                      <li key={topic}>
                        <Link
                          href={`/catalog?topics=${encodeURIComponent(topic)}`}
                          onClick={() => setOpen(false)}
                          className="text-sm text-ink transition-colors hover:text-sage"
                        >
                          {topic}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
