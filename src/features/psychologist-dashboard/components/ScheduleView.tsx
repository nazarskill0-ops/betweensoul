"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AvailabilityExceptions } from "./AvailabilityExceptions";
import { AvailabilityForm } from "./AvailabilityForm";
import { WeeklyCalendarView } from "./WeeklyCalendarView";

type View = "availability" | "calendar";

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

export function ScheduleView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view: View = searchParams.get("view") === "calendar" ? "calendar" : "availability";

  function setView(next: View) {
    const params = new URLSearchParams(searchParams);
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Розклад</h1>

      <div className="flex items-center gap-5 border-b border-sand-dark">
        <TabButton
          label="Доступність"
          isActive={view === "availability"}
          onClick={() => setView("availability")}
        />
        <TabButton
          label="Перегляд"
          isActive={view === "calendar"}
          onClick={() => setView("calendar")}
        />
      </div>

      {view === "availability" ? (
        <div className="flex flex-col gap-6">
          <AvailabilityForm />
          <AvailabilityExceptions />
        </div>
      ) : (
        <WeeklyCalendarView />
      )}
    </div>
  );
}
