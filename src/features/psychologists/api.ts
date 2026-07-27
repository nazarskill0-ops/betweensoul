import { mockPsychologists } from "./mock";
import { CATALOG_PAGE_SIZE } from "./schema";
import type {
  PsychologistCard,
  PsychologistFilters,
  PsychologistProfile,
} from "./schema";

export type PsychologistsPage = {
  items: PsychologistCard[];
  total: number;
  page: number;
  pageSize: number;
};

/*
  Единственное место, где берутся данные о психологах.
  Сейчас работает на моках (mock.ts).
  TODO(backend): заменить на запросы к Supabase — оригинальная реализация
  с RLS-запросами лежит в git-истории этого файла.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchPsychologists(
  filters: PsychologistFilters
): Promise<PsychologistsPage> {
  await delay(300);

  const filtered = mockPsychologists.filter((p) => {
    if (
      filters.q &&
      !p.fullName.toLowerCase().includes(filters.q.toLowerCase())
    ) {
      return false;
    }
    if (filters.service && !p.services.includes(filters.service)) return false;
    if (
      filters.topics &&
      filters.topics.length > 0 &&
      !filters.topics.some(
        (t) => p.topics.includes(t) || p.topicsSecondary.includes(t)
      )
    ) {
      return false;
    }
    if (
      filters.specializations &&
      filters.specializations.length > 0 &&
      !filters.specializations.some((s) => p.specializations.includes(s))
    ) {
      return false;
    }
    if (
      filters.languages &&
      filters.languages.length > 0 &&
      !filters.languages.some((l) => p.languages.includes(l))
    ) {
      return false;
    }
    if (
      filters.clientCategories &&
      filters.clientCategories.length > 0 &&
      !filters.clientCategories.some((c) => p.clientCategories.includes(c))
    ) {
      return false;
    }
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.qualification && p.qualification !== filters.qualification)
      return false;
    if (filters.priceMax && p.priceMinor > filters.priceMax) return false;
    if (filters.priceMin && p.priceMinor < filters.priceMin) return false;
    return true;
  });

  const page = filters.page ?? 1;
  const start = (page - 1) * CATALOG_PAGE_SIZE;
  return {
    items: filtered.slice(start, start + CATALOG_PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

export async function fetchPsychologistById(
  id: string
): Promise<PsychologistProfile | null> {
  await delay(300);
  return mockPsychologists.find((p) => p.profileId === id) ?? null;
}
