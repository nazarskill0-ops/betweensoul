function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "13 липня" → "13 липня, сьогодні" / "завтра" / "післязавтра", інакше без мітки. */
export function formatRelativeDate(date: Date): string {
  const dateLabel = date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  const diffDays = Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);

  if (diffDays === 0) return `${dateLabel}, сьогодні`;
  if (diffDays === 1) return `${dateLabel}, завтра`;
  if (diffDays === 2) return `${dateLabel}, післязавтра`;
  return dateLabel;
}

/** Чи дата припадає на сьогоднішній календарний день. */
export function isToday(date: Date): boolean {
  return startOfDay(date) === startOfDay(new Date());
}
