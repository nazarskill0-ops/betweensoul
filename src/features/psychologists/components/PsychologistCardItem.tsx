import Link from "next/link";
import { QUALIFICATIONS, type PsychologistCard } from "../schema";

const MAX_BADGES = 4;

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік досвіду`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки досвіду`;
  }
  return `${years} років досвіду`;
}

function BadgeGroup({
  items,
  className,
  gapClassName = "gap-3",
}: {
  items: string[];
  className: string;
  gapClassName?: string;
}) {
  const visible = items.slice(0, MAX_BADGES);
  const hiddenCount = items.length - MAX_BADGES;

  return (
    <div className={`flex flex-wrap ${gapClassName}`}>
      {visible.map((item) => (
        <span key={item} className={className}>
          {item}
        </span>
      ))}
      {hiddenCount > 0 && <span className={className}>+{hiddenCount}</span>}
    </div>
  );
}

function getBioExcerpt(bio: string): string {
  const firstSentenceEnd = bio.indexOf(".");
  const firstSentence =
    firstSentenceEnd !== -1 ? bio.slice(0, firstSentenceEnd + 1) : bio;
  if (firstSentence.length <= 100) return firstSentence;
  return `${bio.slice(0, 97).trimEnd()}…`;
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
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function PsychologistCardItem({
  psychologist,
}: {
  psychologist: PsychologistCard;
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

      <div className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-2xl leading-tight text-ink">
            {psychologist.fullName}
          </h3>
          {(qualificationLabel || psychologist.experienceYears !== null) && (
            <div className="flex items-center gap-1.5 text-sm">
              {qualificationLabel && (
                <>
                  <ShieldIcon className="h-4 w-4 shrink-0 text-sage" />
                  <span className="text-base font-medium text-ink">
                    {qualificationLabel}
                  </span>
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
            <BadgeGroup
              items={psychologist.specializations}
              className="rounded-full border-[1.5px] border-transparent bg-sage-light px-4 py-2 text-base text-ink"
            />
          )}

          {psychologist.topics.length > 0 && (
            <BadgeGroup
              items={psychologist.topics}
              className="rounded-full border-[1.5px] border-sand-dark bg-white px-2.5 py-1 text-xs text-ink-muted"
              gapClassName="gap-2"
            />
          )}
        </div>

        {psychologist.bio && (
          <div className="relative rounded-card bg-sage-light p-4">
            <span
              aria-hidden
              className="absolute left-3 top-0 font-display text-3xl leading-none text-sage/40"
            >
              “
            </span>
            <p className="px-4 text-sm text-ink-muted italic">
              {getBioExcerpt(psychologist.bio)}
            </p>
            <span
              aria-hidden
              className="absolute bottom-0 right-3 font-display text-3xl leading-none text-sage/40"
            >
              ”
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="flex items-center gap-1.5 text-base">
            <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
            <span className="text-ink-muted">50 хв</span>
            <span className="text-ink-muted"> · </span>
            <span className="font-semibold text-ink">{priceUah} ₴</span>
          </span>
          <Link
            href={`/psychologist/${psychologist.profileId}`}
            className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
          >
            Переглянути профіль
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
