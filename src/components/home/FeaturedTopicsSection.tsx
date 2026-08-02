"use client";

import Link from "next/link";
import { TOPIC_GROUPS } from "@/features/psychologists/schema";
import { usePsychologists } from "@/features/psychologists/hooks/usePsychologists";
import { TopicPsychologistCard } from "./TopicPsychologistCard";

const FEATURED_COUNT = 6;

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
  const featured = [...(data?.items ?? [])]
    .sort((a, b) => b.sessionsCount - a.sessionsCount)
    .slice(0, FEATURED_COUNT);

  return (
    <section className="bg-sand px-5 md:px-12">
      <div className="mx-auto max-w-6xl py-20 md:py-[100px]">
        <h2 className="mb-10 text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:text-4xl">
          Фахівці за популярними темами
        </h2>

        <div className="mb-14 flex flex-wrap justify-center gap-2.5">
          {FEATURED_TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/catalog?topics=${encodeURIComponent(topic)}`}
              className="rounded-full border-[1.5px] border-sand-dark bg-white px-4.5 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:border-sage hover:text-sage"
            >
              {topic}
            </Link>
          ))}

          <Link
            href="/catalog?view=all"
            className="rounded-full border-[1.5px] border-sage px-4.5 py-2.5 text-sm font-semibold text-sage transition-colors hover:bg-sage-light"
          >
            Дивитися всі
          </Link>
        </div>

        {featured.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {featured.map((psychologist) => (
                <TopicPsychologistCard
                  key={psychologist.profileId}
                  psychologist={psychologist}
                />
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="/pidbir"
                className="flex items-center gap-2 rounded-full bg-sage px-8 py-4 font-semibold text-white transition-colors hover:bg-sage/90"
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
