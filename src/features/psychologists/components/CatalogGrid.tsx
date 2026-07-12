"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePsychologists } from "../hooks/usePsychologists";
import { PsychologistCardItem } from "./PsychologistCardItem";
import type { PsychologistFilters } from "../schema";

export function CatalogGrid({ filters }: { filters: PsychologistFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = usePsychologists(filters);

  const resetFilters = () => {
    const service = searchParams.get("service");
    const params = new URLSearchParams();
    if (service) params.set("service", service);
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

  if (!data || data.length === 0) {
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

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((psychologist) => (
        <PsychologistCardItem key={psychologist.profileId} psychologist={psychologist} />
      ))}
    </div>
  );
}
