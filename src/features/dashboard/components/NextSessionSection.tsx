"use client";

import Link from "next/link";
import { CalendarIcon } from "@/features/psychologists/components/icons";
import { formatSlotRange } from "@/features/psychologists/utils/formatSlotRange";
import { useClientSessions } from "../hooks/useClientSessions";
import { SESSION_TYPE_LABELS, type ClientSession } from "../schema";
import { ArrowUpRightIcon } from "./icons";

const JOIN_WINDOW_MINUTES_BEFORE = 15;

function isUpcoming(session: ClientSession): boolean {
  return (
    new Date(session.startsAt).getTime() > Date.now() &&
    session.status !== "completed" &&
    session.status !== "cancelled"
  );
}

function getNearestSession(sessions: ClientSession[]): ClientSession | null {
  const upcoming = sessions.filter(isUpcoming);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((nearest, session) =>
    new Date(session.startsAt) < new Date(nearest.startsAt) ? session : nearest
  );
}

function canJoin(session: ClientSession): boolean {
  const start = new Date(session.startsAt).getTime();
  const end = start + session.durationMinutes * 60000;
  const now = Date.now();
  return now >= start - JOIN_WINDOW_MINUTES_BEFORE * 60000 && now <= end;
}

export function NextSessionSection() {
  const { data, isLoading } = useClientSessions();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-card bg-sand" />;
  }

  const session = getNearestSession(data ?? []);

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center">
        <CalendarIcon className="h-8 w-8 shrink-0 text-sand-dark" />
        <p className="text-ink-muted">У вас поки немає запланованих сесій</p>
        <Link
          href="/catalog"
          className="rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
        >
          Знайти спеціаліста
        </Link>
      </div>
    );
  }

  const start = new Date(session.startsAt);
  const joinable = canJoin(session);

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
      <h2 className="font-display text-lg text-ink">Найближча сесія</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {session.psychologistAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.psychologistAvatarUrl}
              alt={session.psychologistName}
              className="h-24 w-24 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 shrink-0 rounded-full bg-sage-light" />
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-semibold text-ink">{session.psychologistName}</p>
              <Link
                href={`/psychologist/${session.psychologistId}`}
                aria-label="Переглянути профіль психолога"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-transform hover:scale-105"
              >
                <ArrowUpRightIcon className="h-2.5 w-2.5" />
              </Link>
            </div>
            <p className="text-sm text-ink-muted">
              {start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })} ·{" "}
              {formatSlotRange(start, session.durationMinutes)}
            </p>
            <p className="text-sm text-ink-muted">{SESSION_TYPE_LABELS[session.type]}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={!joinable}
            className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-ink-muted disabled:hover:bg-sand-dark"
          >
            Приєднатись
          </button>
          <button
            type="button"
            className="rounded-full border-[1.5px] border-sand-dark px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-sage hover:text-sage"
          >
            Перенести
          </button>
          <button
            type="button"
            className="rounded-full border-[1.5px] border-sand-dark px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-sage hover:text-sage"
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
