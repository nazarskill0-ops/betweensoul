"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PsychologistProfileContent } from "@/features/psychologists/components/PsychologistProfileContent";
import { COUPLE_THERAPY_SERVICE, type PsychologistProfile } from "@/features/psychologists/schema";
import { getFirstName } from "@/features/psychologists/utils/formatters";
import { usePidbirStore } from "@/stores/pidbir";
import { findMatches } from "../api";
import { requestSchema } from "../schema";

/**
 * Розміри кружечка: великий у спокійному стані, маленький — коли шапка
 * прилипла до верху. Вибраний завжди більший за решту, тож активний елемент
 * читається навіть у стиснутому вигляді. Змінюються width/height, тож
 * transition анімує саме їх.
 *
 * Мобільні значення підібрані так, щоб п'ять кружечків уміщались у 375px без
 * горизонтального скролу; повний розмір вмикається з md.
 */
function avatarSizeClass(isActive: boolean, isStuck: boolean): string {
  if (isStuck) {
    return isActive
      ? "h-[52px] w-[52px] md:h-16 md:w-16"
      : "h-11 w-11 md:h-14 md:w-14";
  }
  return isActive
    ? "h-16 w-16 md:h-[120px] md:w-[120px]"
    : "h-14 w-14 md:h-24 md:w-24";
}

/**
 * Мертва зона навколо точки прилипання, у пікселях. Без неї стан фліпається:
 * стиснення шапки забирає ~80px висоти, контент підстрибує, скрол опиняється
 * по інший бік порогу — і так по колу, поки не проскролиш далі. Прилипаємо,
 * коли сентинел уже на 24px вище вікна, відпускаємо — коли він на 24px нижче.
 */
const STICKY_HYSTERESIS_PX = 24;

/** Ряд аватарок підібраних психологів. */
function MatchAvatarRow({
  psychologists,
  activeId,
  isStuck,
  onSelect,
}: {
  psychologists: PsychologistProfile[];
  activeId: string;
  isStuck: boolean;
  onSelect: (profileId: string) => void;
}) {
  return (
    <div className="flex justify-center">
      {/* items-end: кружечки різного розміру стоять на спільній лінії знизу. */}
      <div className="flex max-w-full items-end gap-2 overflow-x-auto px-1 py-1 md:gap-5">
        {psychologists.map((psychologist) => {
          const { profileId, avatarUrl, fullName } = psychologist;
          const isActive = profileId === activeId;

          return (
            <button
              key={profileId}
              type="button"
              onClick={() => onSelect(profileId)}
              aria-pressed={isActive}
              aria-label={`Показати профіль: ${fullName}`}
              className={`block shrink-0 overflow-hidden rounded-full transition-all duration-300 ${avatarSizeClass(
                isActive,
                isStuck
              )} ${
                isActive
                  ? "ring-[3px] ring-sage ring-offset-2 ring-offset-white"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-sage-light font-medium text-sage">
                  {getFirstName(fullName).charAt(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Обгортка для станів без результату: прогрес зверху, повідомлення під ним. */
function ResultsFallback({
  stepper,
  children,
}: {
  stepper: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 md:py-12">
      {stepper}
      {children}
    </div>
  );
}

/**
 * Крок "Результат": липка шапка (прогрес + аватарки підібраних психологів) і
 * повний профіль обраного під нею. Профіль — той самий компонент, що й на
 * /psychologist/[id] (PsychologistProfileContent), тож перемикання кружечка
 * міняє вміст на місці, без переходу на іншу сторінку.
 *
 * Прогрес приходить пропом, а не рендериться тут: навігація по кроках лишається
 * відповідальністю візарда, а шапка має бути одним липким блоком — прогрес і
 * аватарки разом, як у референсі.
 */
export function PidbirResults({ stepper }: { stepper: React.ReactNode }) {
  const { request, goTo } = usePidbirStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  // Той самий Zod-контракт, що й у кроці запиту: якщо стан неповний
  // (наприклад, крок відкрили напряму), чесніше показати порожній стан.
  const parsed = useMemo(() => requestSchema.safeParse(request), [request]);
  const matches = useMemo(
    () => (parsed.success ? findMatches(parsed.data) : []),
    [parsed]
  );

  /*
    Момент "прилипання" рахуємо по позиції сентинела над шапкою. Саме scroll, а
    не IntersectionObserver: спостерігач дає одну точку перемикання, а нам
    потрібні дві різні (див. STICKY_HYSTERESIS_PX). Обробник дешевий — один
    getBoundingClientRect, а setState з тим самим значенням React не рендерить.
  */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const sync = () => {
      const { top } = sentinel.getBoundingClientRect();
      setIsStuck((prev) =>
        prev ? top < STICKY_HYSTERESIS_PX : top < -STICKY_HYSTERESIS_PX
      );
    };

    // Перший замір відкладаємо на мікротаск: setState прямо в тілі ефекту дав
    // би зайвий каскадний рендер.
    const initial = setTimeout(sync, 0);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  if (!parsed.success) {
    return (
      <ResultsFallback stepper={stepper}>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
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
      </ResultsFallback>
    );
  }

  if (matches.length === 0) {
    return (
      <ResultsFallback stepper={stepper}>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
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
      </ResultsFallback>
    );
  }

  const psychologists = matches.map((match) => match.psychologist);
  // За замовчуванням відкритий найкращий збіг — він перший у ранжуванні.
  const selected =
    psychologists.find((p) => p.profileId === selectedId) ?? psychologists[0];
  const isCoupleService = parsed.data.service === COUPLE_THERAPY_SERVICE;

  return (
    <div className="flex flex-col">
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/*
        Прогрес і аватарки — один липкий блок на всю ширину вікна: інакше при
        скролі кружечки від'їжджали б від своїх смуг прогресу.
      */}
      <div
        className={`sticky top-0 z-30 transition-shadow duration-300 ${
          isStuck ? "border-b border-sand-dark bg-white/90 shadow-sm backdrop-blur-md" : "bg-white"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-6xl flex-col px-5 transition-all duration-300 ${
            isStuck ? "gap-2 py-2" : "gap-3 py-3"
          }`}
        >
          {stepper}
          <MatchAvatarRow
            psychologists={psychologists}
            activeId={selected.profileId}
            isStuck={isStuck}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-6 pb-12">
        {/*
          key — щоб профіль перемонтувався при перемиканні кружечка: інакше
          внутрішній стан (тип сесії, обраний слот, спостерігач за #general-info
          у сайдбарі) лишався б від попереднього психолога.
        */}
        <PsychologistProfileContent
          key={selected.profileId}
          psychologist={selected}
          initialServiceType={
            isCoupleService && selected.couplePriceMinor !== null
              ? "couple"
              : "individual"
          }
        />

        <div className="flex justify-center">
          <Link
            href="/catalog"
            className="rounded-full border-[1.5px] border-sand-dark bg-white px-6 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
          >
            Переглянути весь каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
