import Link from "next/link";
import { formatSlotRange } from "@/features/psychologists/utils/formatSlotRange";
import { SESSION_TYPE_LABELS, type ClientSession } from "../schema";
import { SessionStatusBadge } from "./SessionStatusBadge";

export function SessionCard({ session }: { session: ClientSession }) {
  const start = new Date(session.startsAt);

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          {start.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })} ·{" "}
          {formatSlotRange(start, session.durationMinutes)}
        </span>
        <SessionStatusBadge status={session.status} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">{session.psychologistName}</span>
        <span className="font-medium text-ink">{session.priceMinor / 100} ₴</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">{SESSION_TYPE_LABELS[session.type]}</span>
        <Link
          href={`/psychologist/${session.psychologistId}`}
          className="font-medium text-sage transition-colors hover:text-sage/80"
        >
          Деталі
        </Link>
      </div>
    </div>
  );
}
