import Link from "next/link";

export const metadata = { title: "Підбір спеціаліста — Calmi" };

export default function PidbirPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="rounded-full bg-sage-light px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-sage">
        В розробці
      </span>
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">
        Підбір спеціаліста скоро з&apos;явиться
      </h1>
      <p className="max-w-md text-ink-muted">
        Ми готуємо коротку анкету, яка допоможе підібрати психолога під ваш
        запит автоматично. А поки — оберіть фахівця самостійно в каталозі.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Перейти до каталогу
        </Link>
        <Link
          href="/"
          className="rounded-full border-[1.5px] border-sand-dark px-7 py-3.5 font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Повернутись на головну
        </Link>
      </div>
    </main>
  );
}
