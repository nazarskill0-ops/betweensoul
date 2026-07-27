"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useClientSessions } from "../hooks/useClientSessions";
import type { ClientSession } from "../schema";
import { SessionCard } from "./SessionCard";
import { SessionsEmptyState } from "./SessionsEmptyState";

type Tab = "upcoming" | "history";

function isUpcoming(session: ClientSession): boolean {
  return (
    new Date(session.startsAt).getTime() > Date.now() &&
    session.status !== "completed" &&
    session.status !== "cancelled"
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 pb-2.5 text-sm transition-colors ${
        isActive
          ? "border-sage font-semibold text-sage"
          : "border-transparent font-medium text-ink-muted hover:text-sage/80"
      }`}
    >
      {label}
    </button>
  );
}

export function SessionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "history" ? "history" : "upcoming";
  const { data, isLoading } = useClientSessions();

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const sessions = (data ?? []).filter((session) =>
    tab === "upcoming" ? isUpcoming(session) : !isUpcoming(session)
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Сесії</h1>

      <div className="flex items-center gap-5 border-b border-sand-dark">
        <TabButton
          label="Майбутні"
          isActive={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
        />
        <TabButton
          label="Історія"
          isActive={tab === "history"}
          onClick={() => setTab("history")}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-sand" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <SessionsEmptyState tab={tab} />
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
