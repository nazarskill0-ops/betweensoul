"use client";

import { useRef } from "react";
import type { Review } from "../schema";

function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date(iso))
    .replace(" р.", "");
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div aria-label={`Оцінка ${rating} з 5`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <span key={i} className="text-sage">
            ★
          </span>
        ) : (
          <span key={i} className="text-sand-dark">
            ★
          </span>
        )
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-2 rounded-card border-[1.5px] border-sand-dark bg-white p-4">
      <div className="flex flex-col gap-1">
        <StarRating rating={review.rating} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-ink">{review.author}</span>
          <span className="text-sm text-ink-muted">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>
      </div>

      {review.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border-[1.5px] border-sand-dark px-2.5 py-1 text-xs text-ink-muted"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-ink">{review.text}</p>
    </div>
  );
}

/*
  Без нової залежності (embla-carousel і т.п. не можна — AI_PROMPT.md,
  правило 13: нові пакети в package.json не ставимо). Тому drag-to-scroll
  реалізовано вручну: тягнемо mousedown/mousemove, рахуємо зсув курсора
  й підставляємо його як scrollLeft контейнера.
*/
function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
  };

  const stopDrag = () => {
    drag.current.isDown = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || !drag.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - drag.current.startX;
    el.scrollLeft = drag.current.scrollLeft - walk;
  };

  return { ref, onMouseDown, onMouseMove, onMouseUp: stopDrag, onMouseLeave: stopDrag };
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const drag = useDragScroll<HTMLDivElement>();

  if (reviews.length === 0) return null;

  if (reviews.length === 1) {
    return (
      <div className="flex flex-col gap-3 rounded-card bg-white p-5">
        <h2 className="font-display text-xl font-bold text-ink">Відгуки</h2>
        <ReviewCard review={reviews[0]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-card bg-white p-5">
      <h2 className="font-display text-xl font-bold text-ink">Відгуки</h2>
      <div
        ref={drag.ref}
        onMouseDown={drag.onMouseDown}
        onMouseMove={drag.onMouseMove}
        onMouseUp={drag.onMouseUp}
        onMouseLeave={drag.onMouseLeave}
        className="flex cursor-grab select-none gap-3 overflow-x-auto pb-1 active:cursor-grabbing"
      >
        {reviews.map((review) => (
          <div key={review.id} className="w-80 shrink-0">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}
