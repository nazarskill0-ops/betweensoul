"use client";

import Link from "next/link";
import { useState } from "react";
import { useClientSessions } from "../hooks/useClientSessions";
import type { ClientSession } from "../schema";
import { ArrowUpRightIcon } from "./icons";
import { getEffectiveStatus } from "../utils/sessionStatus";
import { RebookModal } from "./RebookModal";

function getRebookableSessions(sessions: ClientSession[]): ClientSession[] {
  const latestByPsychologist = new Map<string, ClientSession>();
  for (const session of sessions) {
    if (getEffectiveStatus(session) !== "completed") continue;
    const existing = latestByPsychologist.get(session.psychologistId);
    if (!existing || new Date(session.startsAt) > new Date(existing.startsAt)) {
      latestByPsychologist.set(session.psychologistId, session);
    }
  }
  return Array.from(latestByPsychologist.values()).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  );
}

export function RebookSection() {
  const { data, isLoading } = useClientSessions();
  const [rebookTarget, setRebookTarget] = useState<ClientSession | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <h2 className="font-display text-lg text-ink">Записатися повторно</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-sand" />
          ))}
        </div>
      </div>
    );
  }

  const rebookableSessions = getRebookableSessions(data ?? []);
  if (rebookableSessions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
      <h2 className="font-display text-lg text-ink">Записатися повторно</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rebookableSessions.map((session) => (
          <div
            key={session.psychologistId}
            className="flex flex-col items-center gap-2 rounded-card border-[1.5px] border-sand-dark p-3 text-center"
          >
            <div className="relative h-16 w-16 shrink-0">
              {session.psychologistAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.psychologistAvatarUrl}
                  alt={session.psychologistName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-sage-light" />
              )}
              <Link
                href={`/psychologist/${session.psychologistId}`}
                aria-label="Переглянути профіль психолога"
                className="absolute -right-1 -bottom-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-transform hover:scale-105"
              >
                <ArrowUpRightIcon className="h-2.5 w-2.5" />
              </Link>
            </div>
            <p className="w-full text-sm font-medium text-ink">
              {session.psychologistName}
            </p>
            <button
              type="button"
              onClick={() => setRebookTarget(session)}
              className="rounded-full bg-sage px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sage/90"
            >
              Забронювати знову
            </button>
          </div>
        ))}
      </div>

      {rebookTarget && (
        <RebookModal
          psychologistId={rebookTarget.psychologistId}
          psychologistName={rebookTarget.psychologistName}
          psychologistAvatarUrl={rebookTarget.psychologistAvatarUrl}
          onClose={() => setRebookTarget(null)}
        />
      )}
    </div>
  );
}
