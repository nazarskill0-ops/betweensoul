/** Вік на сьогодні за датою народження (YYYY-MM-DD) — не зберігається окремим числом. */
export function calculateAge(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = today.getFullYear() - y;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/** Роки досвіду — поточний рік мінус рік початку практики. */
export function calculateExperienceYears(startYear: number, today: Date = new Date()): number {
  return today.getFullYear() - startYear;
}

/** "Олена Коваленко" → "Олена" — публічний UI показує лише ім'я, прізвище лишається в базі. */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function formatAge(age: number): string {
  const mod100 = age % 100;
  const mod10 = age % 10;
  if (mod10 === 1 && mod100 !== 11) return `${age} рік`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${age} роки`;
  }
  return `${age} років`;
}

export function formatExperienceYears(years: number): string {
  const mod100 = years % 100;
  const mod10 = years % 10;
  if (mod10 === 1 && mod100 !== 11) return `${years} рік`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    return `${years} роки`;
  }
  return `${years} років`;
}

const SESSIONS_BADGE_THRESHOLD = 50;

/** 640 → 600, 1180 → 1000, 320 → 300 — округлення вниз до 1 значущої цифри. */
function floorToSignificantDigit(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.floor(value / magnitude) * magnitude;
}

/** null, якщо сесій замало для бейджа довіри (0 і малі числа виглядають гірше, ніж його відсутність). */
export function formatSessionsCountBadge(sessionsCount: number): string | null {
  if (sessionsCount < SESSIONS_BADGE_THRESHOLD) return null;
  return `${floorToSignificantDigit(sessionsCount)}+`;
}
