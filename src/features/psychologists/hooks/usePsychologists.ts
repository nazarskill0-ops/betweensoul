"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPsychologists } from "../api";
import type { PsychologistFilters } from "../schema";

/*
  The hook components actually use. Wraps the api call in TanStack Query so we
  get caching, loading/error states, and dedup for free.

  The `queryKey` includes the filters — when filters change, TanStack Query
  refetches and caches per-filter-combination automatically.

  Usage in a component:
    const { data, isLoading } = usePsychologists(filters);
*/
export function usePsychologists(filters: PsychologistFilters) {
  return useQuery({
    queryKey: ["psychologists", filters],
    queryFn: () => fetchPsychologists(filters),
  });
}
