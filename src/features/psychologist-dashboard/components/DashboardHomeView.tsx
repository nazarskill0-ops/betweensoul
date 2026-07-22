"use client";

import { MOCK_PSYCHOLOGIST_NAME } from "../mock";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useUpcomingSessions } from "../hooks/useUpcomingSessions";
import { UpcomingSessionItem } from "./UpcomingSessionItem";

function isStillRelevant(startsAt: string, durationMinutes: number): boolean {
  const end = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000);
  return end.getTime() > Date.now();
}

export function DashboardHomeView() {
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: sessions, isLoading: isSessionsLoading } = useUpcomingSessions();

  const upcoming = (sessions ?? [])
    .filter((s) => isStillRelevant(s.startsAt, s.durationMinutes))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Привіт, {MOCK_PSYCHOLOGIST_NAME.split(" ")[0]}!</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-5">
          <p className="text-sm text-ink-muted">Дохід цього місяця</p>
          {isStatsLoading ? (
            <div className="mt-2 h-8 w-32 animate-pulse rounded bg-sand" />
          ) : (
            <p className="mt-1 font-display text-3xl text-ink">
              {((stats?.monthlyRevenueMinor ?? 0) / 100).toLocaleString("uk-UA")} ₴
            </p>
          )}
        </div>
        <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-5">
          <p className="text-sm text-ink-muted">Сесій цього місяця</p>
          {isStatsLoading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-sand" />
          ) : (
            <p className="mt-1 font-display text-3xl text-ink">
              {stats?.monthlySessionsCount ?? 0}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-ink">Найближчі сеанси</h2>

        {isSessionsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-sand" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center text-ink-muted">
            На найближчий час сеансів не заплановано
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((session) => (
              <UpcomingSessionItem key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
