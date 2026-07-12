import Link from "next/link";

/*
  Экран без выбранной услуги: просим клиента сначала определиться с форматом.
  Выбор пишется в URL (?service=...), не в состоянии — страница просто
  перерендерится с новым searchParams.

  Только два формата на старте (по ТЗ) — не путать с полным списком SERVICES.
*/
const GATE_SERVICES = ["Особиста терапія", "Парна терапія"] as const;

export function ServiceGate() {
  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl tracking-tight">
          З чим вам допомогти?
        </h1>
        <p className="text-ink-muted">
          Оберіть формат — покажемо психологів, які з ним працюють
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
        {GATE_SERVICES.map((service) => (
          <Link
            key={service}
            href={`/catalog?service=${encodeURIComponent(service)}`}
            className="rounded-card border-[1.5px] border-sand-dark bg-white px-6 py-8 font-semibold text-ink transition-colors hover:border-sage hover:text-sage"
          >
            {service}
          </Link>
        ))}
      </div>
    </div>
  );
}