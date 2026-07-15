import type { PsychologistProfile } from "../schema";

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік досвіду`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки досвіду`;
  }
  return `${years} років досвіду`;
}

export function PsychologistProfileHeader({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const priceUah = psychologist.priceMinor / 100;

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
          {psychologist.experienceYears !== null && (
            <span className="text-sm text-ink-muted">
              {formatExperienceYears(psychologist.experienceYears)}
            </span>
          )}
        </div>

        {psychologist.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {psychologist.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-sage-light px-3 py-1.5 text-sm text-ink"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <span className="mt-auto text-lg font-semibold text-ink">
          {priceUah} ₴ / сесія
        </span>
      </div>
    </div>
  );
}
