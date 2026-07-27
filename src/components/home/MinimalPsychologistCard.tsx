import Link from "next/link";
import type { PsychologistCard } from "@/features/psychologists/schema";
import { calculateExperienceYears } from "@/features/psychologists/utils/formatters";

function CheckIcon({ className }: { className?: string }) {
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
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
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
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function MinimalPsychologistCard({
  psychologist,
}: {
  psychologist: PsychologistCard;
}) {
  return (
    <Link
      href={`/psychologist/${psychologist.profileId}`}
      className="group relative block aspect-[3/4] w-full shrink-0 overflow-hidden rounded-card border-[1.5px] border-sand-dark"
    >
      {psychologist.avatarUrl ? (
        // TODO(backend): mock photos come from a stock-avatar API (varied
        // color/b&w styles). Production photos should go through a single
        // consistent color-grading step before upload so the grid reads as
        // one system. The filter below is a stopgap visual normalizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={psychologist.avatarUrl}
          alt={psychologist.fullName}
          className="h-full w-full object-cover [filter:grayscale(0.15)_contrast(1.05)_saturate(0.85)]"
        />
      ) : (
        <div className="h-full w-full bg-sage-light" />
      )}

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-3 pr-10 text-white">
        <p className="truncate text-sm font-semibold">
          {psychologist.fullName.split(" ")[0]}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] whitespace-nowrap text-white/85">
          {psychologist.practiceStartYear !== null
            ? `${calculateExperienceYears(psychologist.practiceStartYear)} р. досвіду`
            : "Психолог"}
          <CheckIcon className="h-2.5 w-2.5 shrink-0" />
        </p>
      </div>

      <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-transform group-hover:scale-105">
        <ArrowIcon className="h-3 w-3" />
      </span>
    </Link>
  );
}
