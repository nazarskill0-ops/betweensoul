"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PsychologistCardItem } from "@/features/psychologists/components/PsychologistCardItem";
import { COUPLE_THERAPY_SERVICE } from "@/features/psychologists/schema";
import { getFirstName } from "@/features/psychologists/utils/formatters";
import { usePidbirStore } from "@/stores/pidbir";
import { findMatches } from "../api";
import { requestSchema } from "../schema";

export function ResultsStep() {
  const { request, goTo, reset } = usePidbirStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Той самий Zod-контракт, що й у кроці запиту: якщо стан неповний
  // (наприклад, крок відкрили напряму), чесніше показати порожній стан.
  const parsed = useMemo(() => requestSchema.safeParse(request), [request]);
  const matches = useMemo(
    () => (parsed.success ? findMatches(parsed.data) : []),
    [parsed]
  );

  function selectPsychologist(profileId: string) {
    setActiveId(profileId);
    cardRefs.current[profileId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  if (!parsed.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-ink-muted">
          Схоже, анкета заповнена не до кінця. Повернімось на крок назад.
        </p>
        <button
          type="button"
          onClick={() => goTo("request")}
          className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          До анкети
        </button>
      </div>
    );
  }

  const isCoupleService = parsed.data.service === COUPLE_THERAPY_SERVICE;

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Поки нікого не знайшли
        </h2>
        <p className="max-w-md text-sm text-ink-muted">
          За такими умовами вільних спеціалістів немає. Спробуйте пом&apos;якшити
          додаткові критерії або перегляньте весь каталог.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo("request")}
            className="rounded-full border-[1.5px] border-sand-dark bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
          >
            Змінити критерії
          </button>
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
    <div className="flex flex-col gap-8">
      {/* Стек аватарок — швидке перемикання між підібраними психологами. */}
      <div className="flex justify-end">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {matches.map((match) => {
            const { profileId, avatarUrl, fullName } = match.psychologist;
            const isActive = activeId === profileId;
            return (
              <button
                key={profileId}
                type="button"
                onClick={() => selectPsychologist(profileId)}
                title={fullName}
                aria-label={`Показати профіль: ${fullName}`}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 transition-colors ${
                  isActive ? "border-sage" : "border-white hover:border-sage/50"
                }`}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-sage-light text-sm font-medium text-sage">
                    {getFirstName(fullName).charAt(0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {matches.map((match) => {
          const { profileId } = match.psychologist;
          return (
            <div
              key={profileId}
              ref={(el) => {
                cardRefs.current[profileId] = el;
              }}
              className={`flex flex-col gap-2 rounded-card transition-shadow ${
                activeId === profileId ? "ring-2 ring-sage ring-offset-4" : ""
              }`}
            >
              <PsychologistCardItem
                psychologist={match.psychologist}
                isCoupleService={isCoupleService}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={reset}
          className="text-sm font-medium text-ink-muted transition-colors hover:text-sage"
        >
          Пройти анкету ще раз
        </button>
        <Link
          href="/catalog"
          className="rounded-full border-[1.5px] border-sand-dark bg-white px-6 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Переглянути весь каталог
        </Link>
      </div>
    </div>
  );
}
