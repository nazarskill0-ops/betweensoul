"use client";

import { useState } from "react";
import type { EducationItem, PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";

type Category = "higher" | "courses" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  higher: "Освіта",
  courses: "Курс",
  other: "Досвід",
};

type LightboxState = { urls: string[]; index: number } | null;

function extractSortYear(years?: string): number {
  if (!years) return -1;
  if (years.includes("дотепер")) return 9999;
  const matches = years.match(/\d{4}/g);
  if (!matches || matches.length === 0) return -1;
  return parseInt(matches[matches.length - 1], 10);
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M13 18l6-6-6-6" />
    </svg>
  );
}

export function EducationTimeline({
  education,
}: {
  education: PsychologistProfile["education"];
}) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const entries: (EducationItem & { category: Category })[] = [
    ...education.higher.map((item) => ({ ...item, category: "higher" as const })),
    ...education.courses.map((item) => ({ ...item, category: "courses" as const })),
    ...education.other.map((item) => ({ ...item, category: "other" as const })),
  ].sort((a, b) => extractSortYear(b.years) - extractSortYear(a.years));

  if (entries.length === 0) return null;

  return (
    <CollapsibleSection title="Моя освіта">
      <div className="flex flex-col gap-6 border-l-2 border-sand-dark pl-6">
        {entries.map((entry, i) => (
          <div key={i} className="relative flex flex-col gap-1.5">
            <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-sage ring-4 ring-white" />

            <div className="flex flex-wrap items-center gap-2">
              {entry.years && (
                <span className="font-semibold text-ink">{entry.years}</span>
              )}
              <span className="w-fit rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-sage">
                {CATEGORY_LABELS[entry.category]}
              </span>
            </div>

            <span className="font-semibold text-ink">{entry.title}</span>
            {entry.speciality && (
              <p className="text-sm text-ink-muted">{entry.speciality}</p>
            )}

            {entry.certificateUrls.length > 0 && (
              <button
                type="button"
                onClick={() => setLightbox({ urls: entry.certificateUrls, index: 0 })}
                className="mt-1 w-fit rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink transition-colors hover:border-sage"
              >
                {entry.certificateUrls.length > 1
                  ? `Переглянути документи (${entry.certificateUrls.length})`
                  : "Переглянути диплом"}
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-card bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Закрити"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.urls[lightbox.index]}
                alt={`Документ ${lightbox.index + 1}`}
                className="max-h-[70vh] w-full rounded-card object-contain"
              />

              {lightbox.urls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((state) =>
                        state
                          ? {
                              ...state,
                              index:
                                (state.index - 1 + state.urls.length) % state.urls.length,
                            }
                          : state
                      )
                    }
                    aria-label="Попереднє зображення"
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-sm"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((state) =>
                        state
                          ? { ...state, index: (state.index + 1) % state.urls.length }
                          : state
                      )
                    }
                    aria-label="Наступне зображення"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-sm"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {lightbox.urls.length > 1 && (
              <p className="mt-2 text-center text-sm text-ink-muted">
                {lightbox.index + 1} / {lightbox.urls.length}
              </p>
            )}
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
