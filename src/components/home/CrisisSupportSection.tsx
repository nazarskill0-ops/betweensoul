const HOTLINES = [
  {
    number: "7333",
    label: "Lifeline Ukraine (профілактика самогубств, цілодобово)",
  },
  {
    number: "0 800 100 102",
    label: "Національна психологічна асоціація",
  },
  {
    number: "0 800 211 444",
    label: "Емоційна підтримка МОМ (щодня 10:00–20:00)",
  },
];

export function CrisisSupportSection() {
  return (
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-6xl py-24 md:pt-[110px] md:pb-[100px]">
        <h2 className="font-display text-2xl leading-snug font-extrabold tracking-tight md:text-3xl">
          Потрібна термінова допомога?
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          Calmi — платформа для запису на консультацію, а не служба екстреної
          допомоги. Якщо зараз важко або небезпечно — зверніться на безкоштовну
          гарячу лінію.
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOTLINES.map((line) => (
            <li
              key={line.number}
              className="rounded-card border-[1.5px] border-sand-dark px-6 py-5"
            >
              <a
                href={`tel:${line.number.replace(/\s/g, "")}`}
                className="text-xl font-extrabold text-sage transition-colors hover:text-ink"
              >
                {line.number}
              </a>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {line.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
