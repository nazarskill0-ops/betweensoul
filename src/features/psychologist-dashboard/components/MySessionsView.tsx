"use client";

import { useState } from "react";
import { useClientSessionHistory } from "../hooks/useClientSessionHistory";
import { useUpcomingSessions } from "../hooks/useUpcomingSessions";
import {
  SESSION_HISTORY_STATUS_LABELS,
  SESSION_TYPE_LABELS,
  type ClientSessionHistoryEntry,
  type UpcomingSession,
} from "../schema";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const STATUS_CLASS: Record<ClientSessionHistoryEntry["status"], string> = {
  completed: "text-sage",
  cancelled: "text-ink-muted",
  no_show: "text-rose",
};

function ClientAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-sage">
      {name.charAt(0)}
    </div>
  );
}

function formatHistoryEntry(entry: ClientSessionHistoryEntry): string {
  const start = new Date(entry.startsAt);
  const end = new Date(start.getTime() + entry.durationMinutes * 60_000);
  const dateLabel = start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  const weekdayLabel = start.toLocaleDateString("uk-UA", { weekday: "long" });
  const timeLabel = `${start.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`;
  return `${dateLabel}, ${weekdayLabel}, ${timeLabel}`;
}

function SessionRow({
  session,
  history,
}: {
  session: UpcomingSession;
  history: ClientSessionHistoryEntry[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const start = new Date(session.startsAt);
  const clientHistory = history
    .filter((h) => h.clientName === session.clientName)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <div className="rounded-card border-[1.5px] border-sand-dark bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <ClientAvatar avatarUrl={session.clientAvatarUrl} name={session.clientName} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{session.clientName}</p>
          <p className="text-xs text-ink-muted">
            {start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })} ·{" "}
            {start.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })} ·{" "}
            {SESSION_TYPE_LABELS[session.type]}
          </p>
        </div>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-sand-dark p-4 pt-3">
          <p className="mb-2 text-xs font-medium text-ink-muted">Історія з клієнтом</p>
          {clientHistory.length === 0 ? (
            <p className="text-sm text-ink-muted">Ще не було сесій із цим клієнтом.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {clientHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-[10px] bg-sand/60 px-3 py-2 text-sm"
                >
                  <span className="text-ink">{formatHistoryEntry(entry)}</span>
                  <span className={`font-medium ${STATUS_CLASS[entry.status]}`}>
                    {SESSION_HISTORY_STATUS_LABELS[entry.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function MySessionsView() {
  const { data: sessions, isLoading } = useUpcomingSessions();
  const { data: history } = useClientSessionHistory();

  if (isLoading || !sessions) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-card bg-sand" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center text-ink-muted">
        Найближчих сеансів поки немає
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((session) => (
        <SessionRow key={session.id} session={session} history={history ?? []} />
      ))}
    </div>
  );
}
