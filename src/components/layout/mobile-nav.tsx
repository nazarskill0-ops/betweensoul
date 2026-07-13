"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES, SPECIALIZATIONS, TOPIC_GROUPS } from "@/features/psychologists/schema";

type AccordionKey = "services" | "topics" | "specializations";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<AccordionKey | null>(null);

  function toggleSection(key: AccordionKey) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  function closeAll() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span
          className={`h-0.5 w-6 bg-ink transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`h-0.5 w-6 bg-ink transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-40 overflow-y-auto bg-[#1c2220] px-5 py-6">
          <AccordionSection
            label="Послуги"
            isOpen={expanded === "services"}
            onToggle={() => toggleSection("services")}
          >
            {SERVICES.map((item) => (
              <Link
                key={item}
                href={`/catalog?service=${encodeURIComponent(item)}`}
                onClick={closeAll}
                className="block py-2.5 text-sm text-white/90 transition-colors hover:text-white"
              >
                {item}
              </Link>
            ))}
          </AccordionSection>

          <AccordionSection
            label="Теми"
            isOpen={expanded === "topics"}
            onToggle={() => toggleSection("topics")}
          >
            {TOPIC_GROUPS.map((group) => (
              <div key={group.group} className="mb-4">
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/50">
                  {group.group}
                </div>
                {group.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/catalog?topic=${encodeURIComponent(topic)}`}
                    onClick={closeAll}
                    className="block py-2 text-sm text-white/90 transition-colors hover:text-white"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            ))}
          </AccordionSection>

          <AccordionSection
            label="Методи"
            isOpen={expanded === "specializations"}
            onToggle={() => toggleSection("specializations")}
          >
            {SPECIALIZATIONS.map((item) => (
              <Link
                key={item}
                href={`/catalog?specialization=${encodeURIComponent(item)}`}
                onClick={closeAll}
                className="block py-2.5 text-sm text-white/90 transition-colors hover:text-white"
              >
                {item}
              </Link>
            ))}
          </AccordionSection>

          <Link
            href="/partners"
            onClick={closeAll}
            className="block border-b border-white/10 py-4 text-sm text-white/90"
          >
            Терапевтам
          </Link>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={closeAll}
              className="rounded-full border border-white/30 px-6 py-2.5 text-center text-sm font-medium text-white"
            >
              Вхід
            </Link>
            <Link
              href="/register"
              onClick={closeAll}
              className="rounded-full bg-sage px-6 py-2.5 text-center text-sm font-medium text-white"
            >
              Реєстрація
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AccordionSection({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-white"
      >
        {label}
        <span className={`text-sm transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  );
}