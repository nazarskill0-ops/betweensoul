"use client";

import Link from "next/link";
import { MinimalPsychologistCard } from "@/components/home/MinimalPsychologistCard";
import { useCurrentClientUser } from "../hooks/useCurrentClientUser";
import { useFavoritePsychologists } from "../hooks/useFavoritePsychologists";
import { FavoritesEmptyState } from "./FavoritesEmptyState";
import { ArrowRightIcon } from "./icons";

const HUB_FAVORITES_PREVIEW_COUNT = 3;

export function ProfileHubView() {
  const { data: user } = useCurrentClientUser();
  const { data: favorites, isLoading: isFavoritesLoading } =
    useFavoritePsychologists();
  const firstName = user?.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">
        Привіт{firstName ? `, ${firstName}` : ""}!
      </h1>

      <div className="flex flex-col items-start gap-4 rounded-card bg-sage-light p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl text-ink">Готові до наступної сесії?</p>
          <p className="text-sm text-ink-muted">
            Оберіть психолога та зручний час — це займе кілька хвилин.
          </p>
        </div>
        <Link
          href="/catalog"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose/90"
        >
          Забронювати сесію
          <ArrowRightIcon className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Улюблені психологи</h2>
          {favorites && favorites.length > 0 && (
            <Link
              href="/dashboard/favorites"
              className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
            >
              Усі улюблені
            </Link>
          )}
        </div>

        {isFavoritesLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: HUB_FAVORITES_PREVIEW_COUNT }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-card bg-sand"
              />
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favorites.slice(0, HUB_FAVORITES_PREVIEW_COUNT).map((p) => (
              <MinimalPsychologistCard key={p.profileId} psychologist={p} />
            ))}
          </div>
        ) : (
          <FavoritesEmptyState />
        )}
      </div>
    </div>
  );
}
