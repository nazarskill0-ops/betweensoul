"use client";

import { useState } from "react";
import type { Review } from "../schema";

const VISIBLE_COUNT = 2;

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-ink">{review.author}</span>
        <span className="text-sm text-ink-muted">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>

      <StarRating rating={review.rating} />

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

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) return null;

  const visibleReviews = showAll ? reviews : reviews.slice(0, VISIBLE_COUNT);
  const hasMore = reviews.length > VISIBLE_COUNT;

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-2xl text-ink">Відгуки</h2>

      <div className="flex flex-col gap-3">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-fit rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage"
        >
          {showAll ? "Згорнути" : `Всі відгуки (${reviews.length})`}
        </button>
      )}
    </div>
  );
}
