import Link from "next/link";
import { formatSlotRange } from "@/features/psychologists/utils/formatSlotRange";
import { SESSION_TYPE_LABELS, type ClientSession } from "../schema";
import { getEffectiveStatus } from "../utils/sessionStatus";
import { SessionStatusBadge } from "./SessionStatusBadge";

export function SessionCard({ session }: { session: ClientSession }) {
  const start = new Date(session.startsAt);

  return (
    <div className="flex gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-4 sm:items-center">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-card sm:h-24 sm:w-24">
        {session.psychologistAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.psychologistAvatarUrl}
            alt={session.psychologistName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-sage-light" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium text-ink">{session.psychologistName}</p>
            <p className="text-sm text-ink-muted">
              {start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })} ·{" "}
              {formatSlotRange(start, session.durationMinutes)}
            </p>
          </div>
          <SessionStatusBadge status={getEffectiveStatus(session)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-ink-muted">{SESSION_TYPE_LABELS[session.type]}</span>
          <div className="flex items-center gap-3">
            <span className="font-medium text-ink">{session.priceMinor / 100} ₴</span>
            <Link
              href={`/dashboard/sessions/${session.id}`}
              className="font-medium text-sage transition-colors hover:text-sage/80"
            >
              Деталі
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
