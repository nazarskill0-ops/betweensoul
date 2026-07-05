import Link from "next/link";

/*
  Temporary homepage stub. The real client-facing homepage is Задача 8 in
  docs/TASKS.md (hero, topics, how-it-works, CTA to /catalog and /partners).
*/
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="font-display text-4xl tracking-tight">
        calm<span className="text-sage">i</span>
      </span>
      <p className="max-w-md text-ink-muted">
        Платформа для пошуку психолога онлайн. Головна сторінка в розробці.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Знайти психолога
        </Link>
        <Link
          href="/partners"
          className="rounded-full border-[1.5px] border-sand-dark px-7 py-3.5 font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Я психолог
        </Link>
      </div>
    </main>
  );
}
