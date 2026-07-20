import Link from "next/link";

export function PartnersCTASection() {
  return (
    <section className="px-5 py-20 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-card border-[1.5px] border-sand-dark bg-white px-8 py-12 text-center">
        <h2 className="font-display text-2xl md:text-3xl">
          Ви психолог? Приєднуйтесь безкоштовно
        </h2>
        <p className="max-w-md text-ink-muted">
          Calmi шукає клієнтів за вас — реєстрація для фахівців безкоштовна
          назавжди.
        </p>
        <Link
          href="/partners"
          className="mt-2 rounded-full border-[1.5px] border-sand-dark px-7 py-3 font-medium text-ink transition-colors hover:border-sage hover:text-sage"
        >
          Стати партнером
        </Link>
      </div>
    </section>
  );
}
