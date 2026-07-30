"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAdminPsychologists } from "../hooks/useAdminPsychologists";
import { useUpdatePsychologistStatus } from "../hooks/useUpdatePsychologistStatus";
import { ADMIN_STATUS_FILTERS, adminStatusFilterSchema } from "../schema";
import { QUALIFICATIONS } from "@/features/psychologists/schema";
import { StatusBadge } from "./StatusBadge";

const QUALIFICATION_LABELS = Object.fromEntries(
  QUALIFICATIONS.map((q) => [q.value, q.label])
) as Record<string, string>;

export function AdminPsychologistsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = adminStatusFilterSchema.parse(searchParams.get("status") ?? "all");

  const { data, isLoading } = useAdminPsychologists();
  const updateStatus = useUpdatePsychologistStatus();

  function setStatus(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("status");
    else params.set("status", next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const rows = (data ?? []).filter((r) => status === "all" || r.status === status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Психологи</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Перегляньте анкету перед публікацією — клік по імені відкриває
          публічний профіль.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ADMIN_STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
              status === f.value
                ? "border-sage bg-sage-light text-sage"
                : "border-sand-dark text-ink-muted hover:border-sage"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card border-[1.5px] border-sand-dark bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b-[1.5px] border-sand-dark text-xs font-medium uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3">Психолог</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Реєстрація</th>
              <th className="px-4 py-3">Спеціалізація</th>
              <th className="px-4 py-3">Профіль</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-muted">
                  Завантаження…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-muted">
                  Нікого не знайдено
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.profileId} className="border-b border-sand-dark last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/psychologist/${r.profileId}`}
                    target="_blank"
                    className="font-medium text-ink hover:text-sage"
                  >
                    {r.fullName}
                  </Link>
                  <div className="text-xs text-ink-muted">
                    {QUALIFICATION_LABELS[r.qualification] ?? r.qualification}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{r.email}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {new Date(r.createdAt).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {r.specializations.slice(0, 2).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {r.profileComplete ? (
                    <span className="text-sage">Заповнено</span>
                  ) : (
                    <span className="text-rose">Не заповнено</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "approved" ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ profileId: r.profileId, status: "pending" })
                      }
                      disabled={updateStatus.isPending}
                      className="rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-rose hover:text-rose disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Зняти з публікації
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ profileId: r.profileId, status: "approved" })
                      }
                      disabled={updateStatus.isPending}
                      className="rounded-full bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Опублікувати
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
