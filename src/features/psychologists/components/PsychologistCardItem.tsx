"use client";

import { useState } from "react";
import Link from "next/link";
import { QUALIFICATIONS, type PsychologistCard } from "../schema";

const MAX_TOPIC_BADGES = 4;

function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік досвіду`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки досвіду`;
  }
  return `${years} років досвіду`;
}

function getYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function BadgeGroup({
  items,
  className,
  gapClassName = "gap-3",
  maxVisible,
}: {
  items: string[];
  className: string;
  gapClassName?: string;
  maxVisible: number;
}) {
  const visible = items.slice(0, maxVisible);
  const hiddenCount = items.length - maxVisible;

  return (
    <div className={`flex flex-wrap items-center ${gapClassName}`}>
      {visible.map((item) => (
        <span key={item} className={className}>
          {item}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-full border border-sand-dark px-2.5 py-1 text-[13px] text-ink-muted">
          +{hiddenCount}
        </span>
      )}
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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" fillOpacity={0.9} />
      <path d="M10 8.5v7l6-3.5-6-3.5z" fill="white" />
    </svg>
  );
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

export function PsychologistCardItem({
  psychologist,
}: {
  psychologist: PsychologistCard;
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const priceUah = psychologist.priceMinor / 100;
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;
  const videoId = psychologist.videoUrl
    ? getYoutubeVideoId(psychologist.videoUrl)
    : null;

  return (
    <div className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-5 sm:flex-row sm:gap-6">
      <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-56">
        {psychologist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={psychologist.avatarUrl}
            alt={psychologist.fullName}
            className="h-full w-full rounded-card object-cover"
          />
        ) : (
          <div className="h-full w-full rounded-card bg-sage-light" />
        )}

        {psychologist.videoUrl && (
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            aria-label="Переглянути відео психолога"
            className="absolute bottom-2 right-2 text-sage transition-transform hover:scale-105"
          >
            <PlayIcon className="h-10 w-10 drop-shadow" />
          </button>
        )}
      </div>

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

        <div className="flex flex-col gap-3">
          {psychologist.topics.length > 0 && (
            <BadgeGroup
              items={psychologist.topics}
              className="rounded-full border border-sand-dark bg-white px-3 py-1.5 text-sm text-ink-muted"
              gapClassName="gap-2"
              maxVisible={MAX_TOPIC_BADGES}
            />
          )}

          {psychologist.specializations.length > 0 && (
            <p className="truncate text-base text-ink-muted">
              <span className="font-medium">Методи:</span>{" "}
              {psychologist.specializations.join(", ")}
            </p>
          )}
        </div>

        {psychologist.bio && (
          <div className="border-l-2 border-sage py-1 pl-4">
            <p className="text-sm text-ink-muted italic">
              "{getBioExcerpt(psychologist.bio)}"
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="flex items-center gap-1.5 text-base font-semibold">
            <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
            <span className="text-ink-muted">50 хв</span>
            <span className="text-ink-muted"> · </span>
            <span className="text-ink-muted">{priceUah} ₴</span>
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

      {isVideoOpen && videoId && psychologist.videoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-card bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Закрити"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-card">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`Відео ${psychologist.fullName}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>

            <a
              href={psychologist.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-sage transition-colors hover:text-sage/80"
            >
              Перейти на YouTube
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
