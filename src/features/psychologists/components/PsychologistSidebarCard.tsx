"use client";

import { useMemo } from "react";
import { LANGUAGES, QUALIFICATIONS, type PsychologistProfile } from "../schema";
import { findNearestFreeDay, formatSlotTimeRange } from "../utils/generateFakeSlots";

const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки`;
  }
  return `${years} років`;
}

function formatAge(age: number): string {
  const mod100 = age % 100;
  const mod10 = age % 10;
  if (mod10 === 1 && mod100 !== 11) return `${age} рік`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${age} роки`;
  }
  return `${age} років`;
}

function PersonIcon({ className }: { className?: string }) {
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
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
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
      <path d="M3 12h18" />
      <path d="M12 3c3 3 3 15 0 18" />
      <path d="M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}

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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="ml-auto text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export function PsychologistSidebarCard({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const priceUah = psychologist.priceMinor / 100;
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const languageLabels = psychologist.languages
    .map((code) => LANGUAGES.find((l) => l.value === code)?.label)
    .filter(Boolean);

  const nearestDay = useMemo(() => findNearestFreeDay("individual"), []);
  const nearestFreeSlots = nearestDay
    ? nearestDay.slots.filter((s) => !s.isBooked).slice(0, 2)
    : [];

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-card">
        {psychologist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={psychologist.avatarUrl}
            alt={psychologist.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-sage-light" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl leading-tight text-ink">
          {psychologist.fullName}
        </h1>
        {qualificationLabel && (
          <span className="text-sm text-ink-muted">{qualificationLabel}</span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 rounded-card bg-sand p-3">
        <InfoRow
          icon={<PersonIcon className="h-5 w-5 shrink-0 text-sage" />}
          label="Вік"
          value={formatAge(psychologist.age)}
        />
        {psychologist.experienceYears !== null && (
          <InfoRow
            icon={<BriefcaseIcon className="h-5 w-5 shrink-0 text-sage" />}
            label="Досвід"
            value={formatExperienceYears(psychologist.experienceYears)}
          />
        )}
        {languageLabels.length > 0 && (
          <InfoRow
            icon={<GlobeIcon className="h-5 w-5 shrink-0 text-sage" />}
            label="Мова"
            value={languageLabels.join(", ")}
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 text-lg">
        <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
        <span className="text-ink-muted">50 хв</span>
        <span className="text-ink-muted"> · </span>
        <span className="font-semibold text-ink">{priceUah} ₴</span>
      </div>

      {nearestDay && nearestFreeSlots.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card bg-sage-light p-4">
          <span className="text-sm font-medium text-ink-muted">Найближчий час</span>
          <span className="font-display text-lg font-bold text-ink">
            {nearestDay.date.toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
            })}
          </span>
          <div className="flex flex-wrap gap-2">
            {nearestFreeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={scrollToBooking}
                className="rounded-full border-[1.5px] border-sage bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-sage hover:text-white"
              >
                {formatSlotTimeRange(slot.time, INDIVIDUAL_SESSION_DURATION_MINUTES)}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={scrollToBooking}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-sand transition-colors hover:bg-sage"
      >
        Обрати час
      </button>
    </div>
  );
}
