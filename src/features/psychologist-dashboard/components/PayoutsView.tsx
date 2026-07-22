"use client";

import { payoutForPrice } from "@/lib/config";
import { usePayoutSessions } from "../hooks/usePayoutSessions";
import { PayoutStatusBadge } from "./PayoutStatusBadge";

export function PayoutsView() {
  const { data, isLoading } = usePayoutSessions();
  const sessions = [...(data ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Виплати</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-sand" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center text-ink-muted">
          Тут з&apos;являться сесії з оплатою
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-card border-[1.5px] border-sand-dark bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand-dark text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Клієнт</th>
                  <th className="px-4 py-3 font-medium">Сума</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-sand-dark last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-ink">
                      {new Date(session.date).toLocaleDateString("uk-UA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">
                      {session.clientName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">
                      {payoutForPrice(session.priceMinor) / 100} ₴
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PayoutStatusBadge status={session.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 rounded-card border-[1.5px] border-sand-dark bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">
                    {new Date(session.date).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <PayoutStatusBadge status={session.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{session.clientName}</span>
                  <span className="font-medium text-ink">
                    {payoutForPrice(session.priceMinor) / 100} ₴
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
