"use client";

import Link from "next/link";
import { TOPIC_GROUPS } from "@/features/psychologists/schema";
import { usePsychologists } from "@/features/psychologists/hooks/usePsychologists";
import { MinimalPsychologistCard } from "./MinimalPsychologistCard";

const FEATURED_COUNT = 6;

function TopicIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const ALL_TOPICS = TOPIC_GROUPS.flatMap((g) => g.topics);

const FEATURED_TOPICS = [
  "Тривога та панічні атаки",
  "Депресивні стани",
  "Вигорання та виснаження",
  "Самооцінка та невпевненість",
  "З партнером",
  "Самотність та ізоляція",
  "Втрата та горе",
  "Розлучення чи розрив стосунків",
  "Прокрастинація",
  "Втрата мотивації",
].filter((topic) => (ALL_TOPICS as readonly string[]).includes(topic));

export function FeaturedTopicsSection() {
  // No `featured`/rating field exists on psychologists yet — sessionsCount is
  // the closest proxy for popularity currently in the data model. The list is
  // static and not filtered by the selected topic tag (planned separately).
  const { data } = usePsychologists({});
  const featured = [...(data ?? [])]
    .sort((a, b) => b.sessionsCount - a.sessionsCount)
    .slice(0, FEATURED_COUNT);

  return (
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-5xl py-20">
        <h2 className="mb-8 font-medium text-2xl leading-snug md:text-3xl">
          Фахівці за популярними темами
        </h2>

        <div className="flex flex-wrap gap-3">
          {FEATURED_TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/catalog?topics=${encodeURIComponent(topic)}`}
              className="flex items-center gap-2 rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm text-ink transition-colors hover:border-sage hover:text-sage"
            >
              <TopicIcon className="h-4 w-4 shrink-0 text-sage" />
              {topic}
            </Link>
          ))}

          <Link
            href="/catalog?view=all"
            className="rounded-full border-[1.5px] border-sage px-4 py-2 text-sm font-medium text-sage transition-colors hover:bg-sage-light"
          >
            Дивитися всі
          </Link>
        </div>

        {featured.length > 0 && (
          <>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {featured.map((psychologist) => (
                <MinimalPsychologistCard
                  key={psychologist.profileId}
                  psychologist={psychologist}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/pidbir"
                className="flex items-center gap-2 rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
              >
                Підібрати фахівця
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
