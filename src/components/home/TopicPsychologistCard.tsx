import Link from "next/link";
import type { PsychologistCard } from "@/features/psychologists/schema";
import {
  calculateExperienceYears,
  formatExperienceYears,
  getFirstName,
} from "@/features/psychologists/utils/formatters";

/**
 * Light card used on the landing grid: portrait on a white surface with the
 * name below it. The catalog/favourites overlay card is
 * `MinimalPsychologistCard` — this one is landing-only.
 */
export function TopicPsychologistCard({
  psychologist,
}: {
  psychologist: PsychologistCard;
}) {
  const experience =
    psychologist.practiceStartYear !== null
      ? `${formatExperienceYears(calculateExperienceYears(psychologist.practiceStartYear))} досвіду`
      : "Психолог";

  return (
    <Link
      href={`/psychologist/${psychologist.profileId}`}
      className="group block rounded-2xl bg-white p-5 text-center shadow-[0_12px_30px_-18px_rgba(18,22,20,0.35)] transition-shadow hover:shadow-[0_18px_36px_-16px_rgba(18,22,20,0.4)]"
    >
      <div className="aspect-square w-full overflow-hidden rounded-card bg-sage-light">
        {psychologist.avatarUrl && (
          // TODO(backend): mock photos come from a stock-avatar API with mixed
          // grading; the filter is a stopgap normalizer, same as in
          // MinimalPsychologistCard.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={psychologist.avatarUrl}
            alt={psychologist.fullName}
            className="h-full w-full object-cover [filter:grayscale(0.15)_contrast(1.05)_saturate(0.85)]"
          />
        )}
      </div>

      <p className="mt-4 truncate font-bold text-ink transition-colors group-hover:text-sage">
        {getFirstName(psychologist.fullName)}
      </p>
      <p className="mt-1 text-[13px] text-ink-muted">{experience}</p>
    </Link>
  );
}
