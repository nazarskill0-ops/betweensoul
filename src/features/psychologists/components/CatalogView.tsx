"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatServiceLabel, psychologistFiltersSchema } from "../schema";
import { ServiceGate } from "./ServiceGate";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogGrid } from "./CatalogGrid";

export function CatalogView() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");

  if (!service) {
    return <ServiceGate />;
  }

  const rawParams = Object.fromEntries(searchParams.entries());
  const filters = psychologistFiltersSchema.parse({
    ...rawParams,
    topics: searchParams.get("topics")?.split(",").filter(Boolean),
    specializations: searchParams.get("specializations")?.split(",").filter(Boolean),
    languages: searchParams.get("languages")?.split(",").filter(Boolean),
    clientCategories: searchParams.get("clientCategories")?.split(",").filter(Boolean),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Терапевти Calmi
        </h1>
        <p className="mt-2 font-sans text-lg text-ink-muted">
          Знайдіть свого терапевта за 5 хвилин і зробіть крок до змін
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">{formatServiceLabel(service)}</span>
        <Link
          href="/catalog"
          className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
        >
          Змінити
        </Link>
      </div>
      <CatalogFilters />
      <CatalogGrid filters={filters} />
    </div>
  );
}