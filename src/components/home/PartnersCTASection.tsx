import Link from "next/link";

export function PartnersCTASection() {
  return (
    <section className="bg-sage px-5 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 py-20 text-center text-white">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Ви психолог? Приєднуйтесь безкоштовно
        </h2>
        <p className="max-w-md text-white/85">
          Calmi шукає клієнтів за вас — реєстрація для фахівців безкоштовна
          назавжди.
        </p>
        <Link
          href="/partners"
          className="mt-2 rounded-full bg-white px-7 py-3 font-medium text-sage transition-colors hover:bg-white/90"
        >
          Стати партнером
        </Link>
      </div>
    </section>
  );
}
