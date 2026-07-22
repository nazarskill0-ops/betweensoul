"use client";

import { useEffect, useState } from "react";
import { SESSION_TYPE_LABELS, type UpcomingSession } from "../schema";
import {
  canJoinSession,
  formatSessionTimingStatus,
  getSessionTimingStatus,
} from "../utils/sessionTiming";
import { VideoIcon } from "./icons";

export function UpcomingSessionItem({ session }: { session: UpcomingSession }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(session.startsAt);
  const status = getSessionTimingStatus(session.startsAt, session.durationMinutes, now);
  const canJoin = canJoinSession(session.startsAt, session.durationMinutes, now);
  const isLive = status.kind === "live";

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {session.clientAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.clientAvatarUrl}
            alt={session.clientName}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-sage">
            {session.clientName.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{session.clientName}</p>
          <p className="text-xs text-ink-muted">
            {start.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })} ·{" "}
            {SESSION_TYPE_LABELS[session.type]}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isLive ? "bg-rose/10 text-rose" : "bg-sand text-ink-muted"
          }`}
        >
          {formatSessionTimingStatus(status)}
        </span>

        <button
          type="button"
          disabled={!canJoin}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-sand-dark disabled:text-ink-muted"
        >
          <VideoIcon className="h-4 w-4 shrink-0" />
          Приєднатись
        </button>
      </div>
    </div>
  );
}
