import type { PsychologistProfile } from "@/features/psychologists/schema";
import { calculateAge } from "@/features/psychologists/utils/formatters";
import {
  PSYCHOLOGIST_AGE_GROUPS,
  resolveTopicForMatching,
  type RequestValues,
  type StyleAxis,
  type StyleValue,
} from "./schema";

/** Профіль методу на осях стилю (шкала 1..5, див. METHOD_STYLE). */
type StyleProfile = Record<StyleAxis, number>;

/**
 * Відповіді анкети йдуть по шкалі 1..3, а профілі методів описані детальніше —
 * на 1..5. Три варіанти лягають на полюси й середину цієї шкали, тож
 * спрощення питань не потребує перепису всіх профілів.
 */
const STYLE_SCALE: Record<StyleValue, number> = { 1: 1, 2: 3, 3: 5 };

function toProfileScale(style: RequestValues["style"]): StyleProfile {
  return {
    structure: STYLE_SCALE[style.structure],
    lead: STYLE_SCALE[style.lead],
    timeFocus: STYLE_SCALE[style.timeFocus],
  };
}

/*
  Логіка підбору: чиста функція над масивом психологів, без запитів і без
  залежності від React — тому її можна перевіряти окремо від UI.
*/

/**
 * Профіль методу на тих самих трьох осях, що й питання кроку 3 (1..5).
 * Числа мають той самий сенс, що й `value` варіантів у STYLE_QUESTIONS:
 *   structure  1 = жорсткий протокол        → 5 = вільний потік
 *   lead       1 = терапевт переважно слухає → 5 = веде й дає зворотний зв'язок
 *   timeFocus  1 = робота з «тут і зараз»    → 5 = глибинні причини й минуле
 *
 * Список звірений із методами, які реально трапляються у психологів
 * (features/psychologists/mock.ts) + рештою SPECIALIZATIONS, щоб нові
 * психологи з уже наявної таксономії не падали в дефолт.
 */
const METHOD_STYLE: Record<string, StyleProfile> = {
  "КПТ": { structure: 1, lead: 5, timeFocus: 1 },
  "ДПТ": { structure: 1, lead: 5, timeFocus: 2 },
  "НЛП": { structure: 1, lead: 5, timeFocus: 1 },
  "EMDR": { structure: 1, lead: 4, timeFocus: 4 },
  "Терапія прийняття і відповідальності (ACT)": { structure: 2, lead: 4, timeFocus: 2 },
  "Схема-терапія": { structure: 2, lead: 4, timeFocus: 4 },
  "Травматерапія": { structure: 2, lead: 4, timeFocus: 4 },
  "Позитивна психотерапія": { structure: 3, lead: 4, timeFocus: 2 },
  "Тілесно-орієнтована терапія": { structure: 3, lead: 3, timeFocus: 2 },
  "Психодрама": { structure: 3, lead: 4, timeFocus: 3 },
  "Гештальт": { structure: 3, lead: 4, timeFocus: 2 },
  "Сімейна терапія": { structure: 3, lead: 4, timeFocus: 2 },
  "Системна сімейна терапія": { structure: 3, lead: 4, timeFocus: 3 },
  "Транзактний аналіз": { structure: 3, lead: 4, timeFocus: 4 },
  "Наративна психологія": { structure: 4, lead: 3, timeFocus: 3 },
  "Арт-терапія": { structure: 4, lead: 2, timeFocus: 3 },
  "Клієнт-центрована терапія": { structure: 4, lead: 2, timeFocus: 2 },
  "Символдрама": { structure: 4, lead: 2, timeFocus: 4 },
  "Екзистенційний аналіз": { structure: 4, lead: 2, timeFocus: 4 },
  "Психоаналіз": { structure: 5, lead: 1, timeFocus: 5 },
  "Інше": { structure: 3, lead: 3, timeFocus: 3 },
};

/** Метод поза таксономією не має валити підбір — рахуємо його нейтральним. */
const NEUTRAL_STYLE: StyleProfile = { structure: 3, lead: 3, timeFocus: 3 };

/** Максимальна сума відхилень по трьох осях: |1-5| * 3. */
const MAX_STYLE_DISTANCE = 12;

/** Вага збігу за темою відносно збігу за стилем. Разом дають 1. */
const TOPIC_WEIGHT = 0.6;
const STYLE_WEIGHT = 0.4;

/**
 * Штраф за тему з «З чим я не працюю». Свідомо великий: якщо психолог прямо
 * вказав, що не бере цю тему, високий збіг за стилем не має його витягувати.
 */
const EXCLUDED_TOPIC_PENALTY = 0.5;

/** Тема зі вторинної експертизи важить пів збігу основної. */
const SECONDARY_TOPIC_WEIGHT = 0.5;

export type MatchResult = {
  psychologist: PsychologistProfile;
  score: number;
  /** Метод психолога, який найкраще ліг на відповіді — показуємо як пояснення. */
  matchedMethod: string | null;
  /** Скільки з обраних тем психолог веде як основну експертизу. */
  matchedTopics: string[];
};

function styleDistance(a: StyleProfile, b: StyleProfile): number {
  return (
    Math.abs(a.structure - b.structure) +
    Math.abs(a.lead - b.lead) +
    Math.abs(a.timeFocus - b.timeFocus)
  );
}

/**
 * Найкращий (не середній) збіг серед методів психолога: достатньо одного
 * підходу, який пасує клієнту. Середнє несправедливо карало б тих, хто
 * володіє кількома різними методами.
 */
function bestMethodMatch(
  specializations: string[],
  answers: StyleProfile
): { score: number; method: string | null } {
  let best = { score: 0, method: null as string | null };

  for (const method of specializations) {
    const profile = METHOD_STYLE[method] ?? NEUTRAL_STYLE;
    const score = 1 - styleDistance(profile, answers) / MAX_STYLE_DISTANCE;
    if (score > best.score) best = { score, method };
  }

  return best;
}

function topicMatch(
  psychologist: PsychologistProfile,
  selectedTopics: string[]
): { score: number; matched: string[]; excludedRatio: number } {
  /*
    Частина парних тем поки не має відповідника в профілях психологів
    (див. COUPLE_TOPIC_GROUPS). Такі теми не беруть участі в скорі й не
    потрапляють у знаменник — інакше вибір «Довіра та зрада» просто розмивав
    би збіг за рештою тем однаково для всіх.
  */
  const resolvable = selectedTopics
    .map((label) => ({ label, value: resolveTopicForMatching(label) }))
    .filter((t): t is { label: string; value: string } => t.value !== null);

  if (resolvable.length === 0) {
    return { score: 0, matched: [], excludedRatio: 0 };
  }

  const matched: string[] = [];
  let hits = 0;
  let excluded = 0;

  for (const { label, value } of resolvable) {
    if (psychologist.topics.includes(value)) {
      hits += 1;
      // У чипі результату показуємо формулювання з анкети, а не значення
      // таксономії — користувач обирав саме його.
      matched.push(label);
    } else if (psychologist.topicsSecondary.includes(value)) {
      hits += SECONDARY_TOPIC_WEIGHT;
    }
    if (psychologist.topicsExcluded.includes(value)) excluded += 1;
  }

  return {
    score: hits / resolvable.length,
    matched,
    excludedRatio: excluded / resolvable.length,
  };
}

/** Лишається робочим, хоча блок вікових груп зараз прихований в анкеті. */
function isInAgeGroup(
  psychologist: PsychologistProfile,
  group: NonNullable<RequestValues["ageGroup"]>
): boolean {
  const range = PSYCHOLOGIST_AGE_GROUPS.find((g) => g.value === group);
  if (!range) return true;
  const age = calculateAge(psychologist.birthDate);
  return age >= range.min && age <= range.max;
}

/**
 * Жорсткі умови: формат сесії, статус публікації і уточнення з блоку
 * «Уточнити критерії». Стать, вік і метод — саме фільтр, а не вага: це прямо
 * названі побажання клієнта, і показувати всупереч їм немає сенсу.
 * Ціни тут навмисно немає — вона є в каталозі й на картці психолога.
 */
function passesHardFilters(
  psychologist: PsychologistProfile,
  answers: RequestValues
): boolean {
  if (psychologist.status !== "approved") return false;
  if (!psychologist.services.includes(answers.service)) return false;
  if (answers.gender && psychologist.gender !== answers.gender) return false;
  if (answers.ageGroup && !isInAgeGroup(psychologist, answers.ageGroup)) return false;
  if (
    answers.methods.length > 0 &&
    !answers.methods.some((m) => psychologist.specializations.includes(m))
  ) {
    return false;
  }
  return true;
}

/** Підбір: жорсткі фільтри → скор → сортування. Повертає всіх, хто пройшов. */
export function rankPsychologists(
  psychologists: PsychologistProfile[],
  answers: RequestValues
): MatchResult[] {
  const styleAnswers = toProfileScale(answers.style);

  return psychologists
    .filter((p) => passesHardFilters(p, answers))
    .map((psychologist) => {
      const topic = topicMatch(psychologist, answers.topics);
      const style = bestMethodMatch(psychologist.specializations, styleAnswers);
      const score =
        TOPIC_WEIGHT * topic.score +
        STYLE_WEIGHT * style.score -
        EXCLUDED_TOPIC_PENALTY * topic.excludedRatio;

      return {
        psychologist,
        score: Math.max(0, score),
        matchedMethod: style.method,
        matchedTopics: topic.matched,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Рівний скор — попереду досвідченіший: більше проведених сесій.
      return b.psychologist.sessionsCount - a.psychologist.sessionsCount;
    });
}
