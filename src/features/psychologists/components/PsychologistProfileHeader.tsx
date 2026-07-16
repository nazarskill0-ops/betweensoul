import { QUALIFICATIONS, type PsychologistProfile } from "../schema";

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік досвіду`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки досвіду`;
  }
  return `${years} років досвіду`;
}

function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
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

export function PsychologistProfileHeader({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const priceUah = psychologist.priceMinor / 100;
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;

  return (
    <div className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-5 sm:flex-row sm:gap-6">
      {psychologist.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={psychologist.avatarUrl}
          alt={psychologist.fullName}
          className="h-56 w-full rounded-card object-cover sm:h-auto sm:w-56 sm:shrink-0"
        />
      ) : (
        <div className="h-56 w-full rounded-card bg-sage-light sm:h-auto sm:w-56 sm:shrink-0" />
      )}

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-3xl leading-tight text-ink">
            {psychologist.fullName}
          </h1>
          {psychologist.headline && (
            <p className="text-ink-muted">{psychologist.headline}</p>
          )}
          {(qualificationLabel || psychologist.experienceYears !== null) && (
            <div className="flex items-center gap-1.5 text-sm">
              {qualificationLabel && (
                <>
                  <ShieldIcon className="h-4 w-4 shrink-0 text-sage" />
                  <span className="font-normal text-ink">{qualificationLabel}</span>
                </>
              )}
              {qualificationLabel && psychologist.experienceYears !== null && (
                <span className="text-ink-muted"> · </span>
              )}
              {psychologist.experienceYears !== null && (
                <span className="text-ink-muted">
                  {formatExperienceYears(psychologist.experienceYears)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {psychologist.specializations.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {psychologist.specializations.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border-[1.5px] border-transparent bg-sage-light px-3 py-1.5 text-sm text-ink"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {psychologist.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {psychologist.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border-[1.5px] border-sand-dark bg-white px-3 py-1.5 text-sm text-ink-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <span className="mt-auto flex items-center gap-1.5 text-lg">
          <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          <span className="text-ink-muted">50 хв</span>
          <span className="text-ink-muted"> · </span>
          <span className="font-semibold text-ink">{priceUah} ₴</span>
        </span>
      </div>
    </div>
  );
}
