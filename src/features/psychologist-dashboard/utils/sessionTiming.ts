export type SessionTimingStatus =
  | { kind: "live" }
  | { kind: "soon"; minutes: number }
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "date"; label: string };

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getSessionTimingStatus(
  startsAt: string,
  durationMinutes: number,
  now: Date = new Date()
): SessionTimingStatus {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  if (now >= start && now <= end) return { kind: "live" };

  const minutesUntilStart = Math.round((start.getTime() - now.getTime()) / 60_000);
  if (minutesUntilStart > 0 && minutesUntilStart <= 60) {
    return { kind: "soon", minutes: minutesUntilStart };
  }

  const diffDays = Math.round((startOfDay(start) - startOfDay(now)) / 86_400_000);
  if (diffDays === 0) return { kind: "today" };
  if (diffDays === 1) return { kind: "tomorrow" };

  return {
    kind: "date",
    label: start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" }),
  };
}

export function formatSessionTimingStatus(status: SessionTimingStatus): string {
  switch (status.kind) {
    case "live":
      return "Зараз";
    case "soon":
      return `Через ${status.minutes} хв`;
    case "today":
      return "Сьогодні";
    case "tomorrow":
      return "Завтра";
    case "date":
      return status.label;
  }
}

/** За скільки хвилин до старту з'являється кнопка "Приєднатись". */
export const JOIN_WINDOW_MINUTES_BEFORE = 10;

export function canJoinSession(
  startsAt: string,
  durationMinutes: number,
  now: Date = new Date()
): boolean {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const joinFrom = new Date(start.getTime() - JOIN_WINDOW_MINUTES_BEFORE * 60_000);
  return now >= joinFrom && now <= end;
}
