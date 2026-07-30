"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PsychologistCardItem } from "@/features/psychologists/components/PsychologistCardItem";
import { COUPLE_THERAPY_SERVICE } from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import { findMatches } from "../api";
import { MIN_RESULTS, pidbirAnswersSchema } from "../schema";
import { PrimaryButton } from "./WizardChrome";

/** 1 спеціаліст · 2–4 спеціалісти · 5+ спеціалістів — той самий підхід, що й у formatters.ts. */
function formatSpecialistsCount(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod10 === 1 && mod100 !== 11) return `${count} спеціаліста`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${count} спеціалісти`;
  }
  return `${count} спеціалістів`;
}

export function ResultsStep() {
  const { service, topics, style, criteria, withCriteria, goTo, reset } =
    usePidbirStore();

  // Той самий Zod-контракт, що й у кроків: якщо стан неповний (наприклад,
  // користувач відкрив /pidbir і смикнув крок вручну), краще чесно показати
  // порожній стан, ніж рахувати підбір з дірками.
  const answers = useMemo(
    () =>
      pidbirAnswersSchema.safeParse({
        service,
        topics,
        style,
        gender: criteria.gender,
        priceMaxMinor: criteria.priceMaxMinor,
      }),
    [service, topics, style, criteria]
  );

  const matches = useMemo(
    () => (answers.success ? findMatches(answers.data) : []),
    [answers]
  );

  if (!answers.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-ink-muted">
          Схоже, анкета заповнена не до кінця. Почнімо спочатку — це швидко.
        </p>
        <PrimaryButton type="button" onClick={reset}>
          Пройти анкету
        </PrimaryButton>
      </div>
    );
  }

  const isCoupleService = answers.data.service === COUPLE_THERAPY_SERVICE;

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-display text-2xl tracking-tight text-ink">
          Поки нікого не знайшли
        </h1>
        <p className="max-w-md text-sm text-ink-muted">
          За такими умовами вільних спеціалістів немає. Спробуйте пом&apos;якшити
          побажання або перегляньте весь каталог.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {withCriteria && (
            <button
              type="button"
              onClick={() => goTo("criteria")}
              className="rounded-full border-[1.5px] border-sand-dark px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
            >
              Змінити критерії
            </button>
          )}
          <Link
            href="/catalog"
            className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
          >
            Перейти до каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
          {matches.length === 1
            ? "Знайшли спеціаліста для вас"
            : `Підібрали ${formatSpecialistsCount(matches.length)}`}
        </h1>
        <p className="text-sm text-ink-muted">
          Список відсортований за тим, наскільки психолог збігається з вашим
          запитом і стилем роботи.
        </p>
      </div>

      {matches.length < MIN_RESULTS && (
        <p className="rounded-card border-[1.5px] border-sand-dark bg-white px-4 py-3 text-sm text-ink-muted">
          Варіантів небагато — за вашими умовами підійшли не всі. Спробуйте
          пом&apos;якшити побажання, щоб побачити більше.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {matches.map((match) => (
          <div key={match.psychologist.profileId} className="flex flex-col gap-2">
            {(match.matchedTopics.length > 0 || match.matchedMethod) && (
              <div className="flex flex-wrap items-center gap-2 px-1">
                {match.matchedMethod && (
                  <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-sage">
                    Підхід: {match.matchedMethod}
                  </span>
                )}
                {match.matchedTopics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-sand px-3 py-1 text-xs text-ink-muted"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
            <PsychologistCardItem
              psychologist={match.psychologist}
              isCoupleService={isCoupleService}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-ink-muted transition-colors hover:text-sage"
        >
          Пройти анкету ще раз
        </button>
        <Link
          href="/catalog"
          className="rounded-full border-[1.5px] border-sand-dark px-6 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Переглянути весь каталог
        </Link>
      </div>
    </div>
  );
}
