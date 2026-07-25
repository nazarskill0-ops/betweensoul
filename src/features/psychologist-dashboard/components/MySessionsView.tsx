"use client";

import { useState } from "react";
import { useClientSessionHistory } from "../hooks/useClientSessionHistory";
import { useUpcomingSessions } from "../hooks/useUpcomingSessions";
import { SESSION_TYPE_LABELS, type UpcomingSession } from "../schema";

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

/** Котра це за рахунком сесія з клієнтом — кількість записів в історії з тим
 * самим ім'ям клієнта, що відбуваються не пізніше за цю сесію. */
function sessionOrdinal(session: UpcomingSession, history: UpcomingSession[]): number {
  return history.filter(
    (h) => h.clientName === session.clientName && h.startsAt <= session.startsAt
  ).length;
}

function ClientAvatar({ session }: { session: UpcomingSession }) {
  if (session.clientAvatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={session.clientAvatarUrl}
        alt={session.clientName}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-sage">
      {session.clientName.charAt(0)}
    </div>
  );
}

export function MySessionsView() {
  const { data: sessions, isLoading } = useUpcomingSessions();
  const { data: history } = useClientSessionHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      {sorted.map((session) => {
        const start = new Date(session.startsAt);
        const isExpanded = expandedId === session.id;
        const ordinal = history ? sessionOrdinal(session, history) : null;

        return (
          <div
            key={session.id}
            className="rounded-card border-[1.5px] border-sand-dark bg-white p-4"
          >
            <div className="flex items-center gap-4">
              <ClientAvatar session={session} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{session.clientName}</p>
                <p className="text-xs text-ink-muted">
                  {start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })} ·{" "}
                  {start.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {SESSION_TYPE_LABELS[session.type]}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
                aria-expanded={isExpanded}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-sage transition-colors hover:text-sage/80"
              >
                Історія з клієнтом
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {isExpanded && (
              <p className="mt-3 border-t border-sand-dark pt-3 text-sm text-ink-muted">
                {ordinal !== null
                  ? `Це ${ordinal}-та сесія з цим клієнтом.`
                  : "Історія завантажується..."}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
