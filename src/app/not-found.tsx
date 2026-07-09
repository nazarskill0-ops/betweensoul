import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <span className="font-display text-7xl text-sage">404</span>
      <h1 className="font-display text-2xl">Такої сторінки немає</h1>
      <p className="max-w-sm text-ink-muted">
        Сайт ще в розробці — можливо, цю сторінку ми ще не зробили, або в адресі
        помилка.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
      >
        На головну
      </Link>
    </main>
  );
}
