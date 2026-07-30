import { mockPsychologists } from "@/features/psychologists/mock";
import { rankPsychologists, type MatchResult } from "./matching";
import { MAX_RESULTS, type PidbirAnswers } from "./schema";

/*
  Єдине місце, звідки підбір бере психологів.
  Зараз це той самий mock.ts, що й каталог — жодного мережевого виклику, тому
  тут синхронна функція без TanStack Query: підбір це фільтр по масиву, який
  уже в пам'яті, і штучна затримка додала б лише спінер на порожньому місці.
  TODO(backend): коли психологи переїдуть у Supabase, скоринг лишається тут,
  а вибірку кандидатів замінити на запит із фільтрами (status/services/ціна).
*/

export function findMatches(answers: PidbirAnswers): MatchResult[] {
  return rankPsychologists(mockPsychologists, answers).slice(0, MAX_RESULTS);
}
