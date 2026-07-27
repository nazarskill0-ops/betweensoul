"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePsychologists } from "../hooks/usePsychologists";
import { PsychologistCardItem } from "./PsychologistCardItem";
import { COUPLE_THERAPY_SERVICE, type PsychologistFilters } from "../schema";

function ChevronIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
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
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/** Справжня посторінкова навігація — кнопки з номерами сторінок, не автопідвантаження при скролі. */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Сторінки каталогу"
      className="flex items-center justify-center gap-1.5 pt-4"
    >
      <button
        type="button"
        aria-label="Попередня сторінка"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sand-dark text-ink-muted transition-colors hover:border-sage hover:text-sage disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-sand-dark disabled:hover:text-ink-muted"
      >
        <ChevronIcon direction="left" className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPageChange(p)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] text-sm font-medium transition-colors ${
            p === page
              ? "border-sage bg-sage-light text-sage"
              : "border-sand-dark text-ink-muted hover:border-sage hover:text-sage"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Наступна сторінка"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-sand-dark text-ink-muted transition-colors hover:border-sage hover:text-sage disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-sand-dark disabled:hover:text-ink-muted"
      >
        <ChevronIcon direction="right" className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function CatalogGrid({ filters }: { filters: PsychologistFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } =
    usePsychologists(filters);
  const isCoupleService = filters.service === COUPLE_THERAPY_SERVICE;
  // "Усі фахівці" — жоден тип послуги не обрано, тож показуємо обидва
  // варіанти ціни/тривалості, якщо психолог проводить парні сесії.
  const showBothPricing = !filters.service;

  const resetFilters = () => {
    const service = searchParams.get("service");
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    // Скидання фільтрів — не пов'язана з поточним скролом дія користувача,
    // тож зберігаємо позицію так само, як і решта router.replace у фільтрах.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    // На відміну від фільтрів, перехід на іншу сторінку навмисно скролить
    // угору — інакше клієнт бачить порожнє місце там, де на попередній
    // сторінці була картка, на яку він клікнув "2".
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-ink-muted">
          Не вдалося завантажити список психологів. Перевірте з&apos;єднання й спробуйте ще раз.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-ink-muted">Нікого не знайдено за цими фільтрами</p>
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm font-medium text-rose transition-colors hover:text-rose/80"
        >
          Скинути фільтри
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="flex flex-col gap-4">
      {/* Плавний перехід між результатами — старі картки лишаються видимими
          (placeholderData) і лише притлумлюються під час фонового
          довантаження нових, замість зникнення в спінер/порожній стан. */}
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity ${
          isFetching && isPlaceholderData ? "opacity-60" : "opacity-100"
        }`}
      >
        {data.items.map((psychologist) => (
          <PsychologistCardItem
            key={psychologist.profileId}
            psychologist={psychologist}
            isCoupleService={isCoupleService}
            showBothPricing={showBothPricing}
          />
        ))}
      </div>

      <Pagination page={data.page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
