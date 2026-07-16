"use client";

import { LANGUAGES, QUALIFICATIONS, type PsychologistProfile } from "../schema";

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік досвіду`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки досвіду`;
  }
  return `${years} років досвіду`;
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

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-card">
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

        {qualificationLabel && (
          <span className="absolute left-0 top-4 rounded-r-full bg-sage px-4 py-1.5 text-sm font-bold text-white shadow-sm">
            {qualificationLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl leading-tight text-ink">
          {psychologist.fullName}
        </h1>
        <span className="text-sm text-ink-muted">
          {formatAge(psychologist.age)}
          {psychologist.experienceYears !== null &&
            ` · ${formatExperienceYears(psychologist.experienceYears)}`}
        </span>
        {languageLabels.length > 0 && (
          <span className="text-sm text-ink-muted">
            {languageLabels.join(", ")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-lg">
        <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
        <span className="text-ink-muted">50 хв</span>
        <span className="text-ink-muted"> · </span>
        <span className="font-semibold text-ink">{priceUah} ₴</span>
      </div>

      <button
        type="button"
        onClick={scrollToBooking}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-sand transition-colors hover:bg-sage"
      >
        Забронювати
      </button>
    </div>
  );
}
