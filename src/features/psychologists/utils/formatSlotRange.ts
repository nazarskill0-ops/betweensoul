/** 09:00 (Date) + 50 хв → "09:00–09:50". */
export function formatSlotRange(start: Date, durationMinutes: number): string {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${formatTime(start)}–${formatTime(end)}`;
}
