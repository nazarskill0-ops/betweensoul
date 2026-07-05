import { mockPsychologists } from "./mock";
import type {
  PsychologistCard,
  PsychologistFilters,
  PsychologistProfile,
} from "./schema";

/*
  Единственное место, где берутся данные о психологах.
  Сейчас работает на моках (mock.ts).
  TODO(backend): заменить на запросы к Supabase — оригинальная реализация
  с RLS-запросами лежит в git-истории этого файла.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchPsychologists(
  filters: PsychologistFilters
): Promise<PsychologistCard[]> {
  await delay(300);

  return mockPsychologists.filter((p) => {
    if (
      filters.q &&
      !p.fullName.toLowerCase().includes(filters.q.toLowerCase())
    ) {
      return false;
    }
    if (filters.service && !p.services.includes(filters.service)) return false;
    if (filters.topic && !p.topics.includes(filters.topic)) return false;
    if (
      filters.specialization &&
      !p.specializations.includes(filters.specialization)
    ) {
      return false;
    }
    if (filters.language && !p.languages.includes(filters.language))
      return false;
    if (filters.priceMax && p.priceMinor > filters.priceMax) return false;
    return true;
  });
}

export async function fetchPsychologistById(
  id: string
): Promise<PsychologistProfile | null> {
  await delay(300);
  return mockPsychologists.find((p) => p.profileId === id) ?? null;
}
