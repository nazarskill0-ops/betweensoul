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
    <section className="border-t border-sand-dark">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <h2 className="font-display text-2xl leading-snug md:text-3xl">
          Потрібна термінова допомога?
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Calmi — платформа для запису на консультацію, а не служба екстреної
          допомоги. Якщо зараз важко або небезпечно — зверніться на безкоштовну
          гарячу лінію.
        </p>

        <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
          {HOTLINES.map((line) => (
            <li key={line.number} className="text-sm">
              <span className="font-semibold text-ink">{line.number}</span>
              <span className="text-ink-muted"> — {line.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
