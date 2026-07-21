import Link from "next/link";
import { HeartIcon } from "@/features/psychologists/components/icons";

export function FavoritesEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-8 text-center">
      <HeartIcon className="h-8 w-8 shrink-0 text-sand-dark" />
      <p className="text-ink-muted">У вас поки немає обраних фахівців</p>
      <Link
        href="/catalog"
        className="rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
      >
        Обрати фахівця
      </Link>
    </div>
  );
}
