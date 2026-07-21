"use client";

import { MinimalPsychologistCard } from "@/components/home/MinimalPsychologistCard";
import { useFavoritePsychologists } from "../hooks/useFavoritePsychologists";
import { FavoritesEmptyState } from "./FavoritesEmptyState";

export function FavoritesView() {
  const { data: favorites, isLoading } = useFavoritePsychologists();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Улюблені психологи</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-card bg-sand"
            />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((p) => (
            <MinimalPsychologistCard key={p.profileId} psychologist={p} />
          ))}
        </div>
      ) : (
        <FavoritesEmptyState />
      )}
    </div>
  );
}
