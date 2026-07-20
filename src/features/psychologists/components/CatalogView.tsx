"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { psychologistFiltersSchema } from "../schema";
import { ServiceGate } from "./ServiceGate";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogGrid } from "./CatalogGrid";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumbs";

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const service = searchParams.get("service");

  // Once the user arrives with any filter already in the URL (e.g. a topic
  // clicked from the header), stay in the grid even if that filter is later
  // cleared — only a genuinely bare /catalog visit should show ServiceGate.
  const [skipGate] = useState(() => searchParams.toString().length > 0);

  const rawParams = Object.fromEntries(searchParams.entries());
  const filters = psychologistFiltersSchema.parse({
    ...rawParams,
    topics: searchParams.get("topics")?.split(",").filter(Boolean),
    specializations: searchParams.get("specializations")?.split(",").filter(Boolean),
    languages: searchParams.get("languages")?.split(",").filter(Boolean),
    clientCategories: searchParams.get("clientCategories")?.split(",").filter(Boolean),
  });

  function removeTopic(topic: string) {
    const params = new URLSearchParams(searchParams.toString());
    const remaining = (filters.topics ?? []).filter((t) => t !== topic);
    if (remaining.length > 0) {
      params.set("topics", remaining.join(","));
    } else {
      params.delete("topics");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (!service && !skipGate) {
    const gateCrumbs: BreadcrumbItem[] = [
      { label: "Calmi", href: "/" },
      { label: "Каталог" },
    ];
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs items={gateCrumbs} />
        <ServiceGate />
      </div>
    );
  }

  const activeLabel = filters.topics?.[0] ?? service ?? undefined;
  const crumbs: BreadcrumbItem[] = [
    { label: "Calmi", href: "/" },
    { label: "Каталог", href: activeLabel ? "/catalog" : undefined },
    ...(activeLabel ? [{ label: activeLabel }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={crumbs} />

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Терапевти Calmi
        </h1>
        <p className="mt-2 font-sans text-lg text-ink-muted">
          Знайдіть свого терапевта за 5 хвилин і зробіть крок до змін
        </p>
      </div>

      {service && (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{service}</span>
          <Link
            href="/catalog"
            className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
          >
            Змінити
          </Link>
        </div>
      )}

      {filters.topics && filters.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => removeTopic(topic)}
              className="flex items-center gap-1.5 rounded-full bg-sage-light px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-sage/20"
            >
              {topic}
              <span aria-hidden>✕</span>
            </button>
          ))}
        </div>
      )}

      <CatalogFilters />
      <CatalogGrid filters={filters} />
    </div>
  );
}
