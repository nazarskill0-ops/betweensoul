import type { AvailabilityException } from "../schema";

/** "2026-08-15".."2026-08-25" → "15–25 серпня 2026 р."; один день → повна дата. */
export function formatExceptionRange(exception: AvailabilityException): string {
  const start = new Date(exception.startDate);
  const end = new Date(exception.endDate);

  if (exception.startDate === exception.endDate) {
    return start.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const endLabel = end.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start.getDate()}–${endLabel}`;
  }

  const startLabel = start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  const endLabel = end.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}
