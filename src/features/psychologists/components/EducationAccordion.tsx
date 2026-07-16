"use client";

import { useState } from "react";
import type { EducationItem, PsychologistProfile } from "../schema";

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

function EducationItemView({ item }: { item: EducationItem }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-semibold text-ink">{item.title}</span>
        {item.years && (
          <span className="text-sm text-ink-muted">{item.years}</span>
        )}
      </div>
      {item.speciality && (
        <p className="text-sm text-ink-muted">{item.speciality}</p>
      )}

      {item.certificateUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {item.certificateUrls.map((url, i) => (
            <a
              key={url + i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-card border-[1.5px] border-sand-dark"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Сертифікат ${i + 1}`}
                className="h-20 w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function EducationAccordion({
  education,
}: {
  education: PsychologistProfile["education"];
}) {
  const sections = [
    { key: "higher", label: "Вища та професійна освіта", items: education.higher },
    { key: "courses", label: "Професійні курси", items: education.courses },
    { key: "other", label: "Інший досвід", items: education.other },
  ].filter((section) => section.items.length > 0);

  const [openKey, setOpenKey] = useState<string | null>(
    sections[0]?.key ?? null
  );

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-2xl text-ink">Моя освіта</h2>

      <div className="flex flex-col divide-y divide-sand-dark">
        {sections.map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div key={section.key} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : section.key)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="font-medium text-ink">{section.label}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-ink-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-4 flex flex-col gap-5">
                  {section.items.map((item, i) => (
                    <EducationItemView key={`${section.key}-${i}`} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
