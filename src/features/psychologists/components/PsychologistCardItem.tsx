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
          {(psychologist.experienceYears !== null || qualificationLabel) && (
            <div className="text-sm">
              {psychologist.experienceYears !== null && (
                <span className="text-ink-muted">
                  {formatExperienceYears(psychologist.experienceYears)}
                </span>
              )}
              {psychologist.experienceYears !== null && qualificationLabel && (
                <span className="text-ink-muted"> · </span>
              )}
              {qualificationLabel && (
                <span className="text-base font-medium text-ink">
                  {qualificationLabel}
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
          <p className="rounded-card bg-sage-light p-4 text-sm text-ink-muted italic">
            “{getBioExcerpt(psychologist.bio)}”
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-base font-semibold text-ink">
            Сесія 50 хв — {priceUah} ₴
          </span>
          <Link
            href={`/psychologist/${psychologist.profileId}`}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
          >
            Переглянути профіль
          </Link>
        </div>
      </div>
    </div>
  );
}
