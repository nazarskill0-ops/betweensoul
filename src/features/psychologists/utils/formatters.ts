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
