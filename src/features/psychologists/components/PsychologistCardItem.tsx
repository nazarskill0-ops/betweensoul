"use client";

import { useState } from "react";
import Link from "next/link";
import { QUALIFICATIONS, type PsychologistCard } from "../schema";
import { INDIVIDUAL_SESSION_DURATION_MINUTES } from "../utils/availabilityStore";
import { calculateExperienceYears, formatSessionsCountBadge } from "../utils/formatters";
import { CheckIcon } from "./icons";

const MAX_TOPIC_BADGES = 4;
const ABOUT_ME_EXCERPT_LENGTH = 380;

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

function LabeledText({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <p className={`text-base text-ink ${className}`}>{children}</p>
    </div>
  );
}

function getAboutMeExcerpt(aboutMe: string): { text: string; isTruncated: boolean } {
  if (aboutMe.length <= ABOUT_ME_EXCERPT_LENGTH) {
    return { text: aboutMe, isTruncated: false };
  }
  return {
    text: `${aboutMe.slice(0, ABOUT_ME_EXCERPT_LENGTH).trimEnd()}…`,
    isTruncated: true,
  };
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 pb-1.5 text-sm text-sage transition-colors ${
        isActive
          ? "border-sage font-semibold"
          : "border-transparent font-medium hover:text-sage/80"
      }`}
    >
      {label}
    </button>
  );
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

function PriceRow({
  durationMinutes,
  priceMinor,
  label,
}: {
  durationMinutes: number;
  priceMinor: number;
  label?: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-base font-bold">
      <ClockIcon className="h-4 w-4 shrink-0 text-ink-muted" />
      <span className="text-ink-muted">{durationMinutes} хв</span>
      <span className="text-ink-muted"> · </span>
      <span className="text-ink-muted">{priceMinor / 100} ₴</span>
      {label && <span className="text-sm font-medium text-ink-muted"> — {label}</span>}
    </span>
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
  isCoupleService = false,
  showBothPricing = false,
}: {
  psychologist: PsychologistCard;
  isCoupleService?: boolean;
  showBothPricing?: boolean;
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "about">("main");
  const activeDurationMinutes = isCoupleService
    ? (psychologist.coupleSessionDurationMinutes ?? INDIVIDUAL_SESSION_DURATION_MINUTES)
    : INDIVIDUAL_SESSION_DURATION_MINUTES;
  const activePriceMinor = isCoupleService
    ? (psychologist.couplePriceMinor ?? psychologist.priceMinor)
    : psychologist.priceMinor;
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;
  const sessionsBadge = formatSessionsCountBadge(psychologist.sessionsCount);
  const aboutMeExcerpt = getAboutMeExcerpt(psychologist.aboutMe);
  const visibleTopics = psychologist.topics.slice(0, MAX_TOPIC_BADGES);
  const hiddenTopicsCount = psychologist.topics.length - MAX_TOPIC_BADGES;
  const videoId = psychologist.videoUrl
    ? getYoutubeVideoId(psychologist.videoUrl)
    : null;

  return (
    <div className="flex flex-col gap-5 rounded-card border-[1.5px] border-sand-dark bg-white p-5 sm:flex-row sm:gap-6">
      <div className="relative h-56 w-full shrink-0 self-start sm:aspect-[4/5] sm:h-auto sm:w-56">
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
          <h3 className="font-display text-2xl font-bold leading-tight text-ink">
            {psychologist.fullName}
          </h3>
          {(qualificationLabel || psychologist.practiceStartYear !== null) && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
              {qualificationLabel && (
                <>
                  <ShieldIcon className="h-4 w-4 shrink-0 text-sage" />
                  <span>{qualificationLabel}</span>
                </>
              )}
              {qualificationLabel && psychologist.practiceStartYear !== null && (
                <span className="font-normal text-ink-muted"> · </span>
              )}
              {psychologist.practiceStartYear !== null && (
                <span>
                  {formatExperienceYears(calculateExperienceYears(psychologist.practiceStartYear))}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-ink-muted">
            <span className="flex items-center gap-1">
              <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
              Підтверджений диплом
            </span>
            {sessionsBadge && (
              <span className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
                {sessionsBadge} проведених сесій
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <TabButton
              label="Основне"
              isActive={activeTab === "main"}
              onClick={() => setActiveTab("main")}
            />
            <TabButton
              label="Про мене"
              isActive={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
          </div>

          {activeTab === "main" ? (
            <div className="flex flex-col gap-3">
              {psychologist.specializations.length > 0 && (
                <LabeledText label="Методи роботи">
                  {psychologist.specializations.join(", ")}
                </LabeledText>
              )}

              {psychologist.topics.length > 0 && (
                <LabeledText label="Працює з темами">
                  {visibleTopics.join(", ")}
                  {hiddenTopicsCount > 0 && (
                    <>
                      {" "}
                      <Link
                        href={`/psychologist/${psychologist.profileId}`}
                        className="font-medium text-sage transition-colors hover:text-sage/80"
                      >
                        і ще {hiddenTopicsCount}
                      </Link>
                    </>
                  )}
                </LabeledText>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <LabeledText label="Про терапевта" className="line-clamp-5">
                {aboutMeExcerpt.text}
              </LabeledText>
              {aboutMeExcerpt.isTruncated && (
                <Link
                  href={`/psychologist/${psychologist.profileId}`}
                  className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
                >
                  Читати далі
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          {showBothPricing &&
          psychologist.couplePriceMinor !== null &&
          psychologist.coupleSessionDurationMinutes !== null ? (
            <div className="flex flex-col gap-1">
              <PriceRow
                durationMinutes={INDIVIDUAL_SESSION_DURATION_MINUTES}
                priceMinor={psychologist.priceMinor}
                label="індивідуальна"
              />
              <PriceRow
                durationMinutes={psychologist.coupleSessionDurationMinutes}
                priceMinor={psychologist.couplePriceMinor}
                label="парна"
              />
            </div>
          ) : (
            <PriceRow durationMinutes={activeDurationMinutes} priceMinor={activePriceMinor} />
          )}
          <Link
            href={`/psychologist/${psychologist.profileId}`}
            className="flex items-center gap-1.5 rounded-full bg-ink-muted px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
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
