import Link from "next/link";
import { CalendarIcon } from "@/features/psychologists/components/icons";

export function SessionsEmptyState({ tab }: { tab: "upcoming" | "history" }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center">
      <CalendarIcon className="h-8 w-8 shrink-0 text-sand-dark" />
      {tab === "upcoming" ? (
        <>
          <p className="text-ink-muted">У вас ще немає майбутніх сесій</p>
          <Link
            href="/catalog"
            className="rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
          >
            Знайти психолога
          </Link>
        </>
      ) : (
        <p className="text-ink-muted">Тут з&apos;являться ваші минулі сесії</p>
      )}
    </div>
  );
}
