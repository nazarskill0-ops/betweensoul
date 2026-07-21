import Link from "next/link";
import { formatSlotRange } from "@/features/psychologists/utils/formatSlotRange";
import { SESSION_TYPE_LABELS, type ClientSession } from "../schema";
import { SessionStatusBadge } from "./SessionStatusBadge";

export function SessionsTable({ sessions }: { sessions: ClientSession[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-card border-[1.5px] border-sand-dark bg-white md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-sand-dark text-xs text-ink-muted">
            <th className="px-4 py-3 font-medium">Дата</th>
            <th className="px-4 py-3 font-medium">Час</th>
            <th className="px-4 py-3 font-medium">Тип</th>
            <th className="px-4 py-3 font-medium">Психолог</th>
            <th className="px-4 py-3 font-medium">Ціна</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const start = new Date(session.startsAt);
            return (
              <tr key={session.id} className="border-b border-sand-dark last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-ink">
                  {start.toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  {formatSlotRange(start, session.durationMinutes)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                  {SESSION_TYPE_LABELS[session.type]}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink">
                  {session.psychologistName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink">
                  {session.priceMinor / 100} ₴
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <SessionStatusBadge status={session.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/psychologist/${session.psychologistId}`}
                    className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
                  >
                    Деталі
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
