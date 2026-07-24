const STEPS = [
  {
    n: 1,
    title: "Оберіть психолога",
    text: "Фільтруйте за темою, методом, мовою і вартістю",
  },
  {
    n: 2,
    title: "Забронюйте час",
    text: "Оберіть слот та оплатіть сесію.",
  },
  {
    n: 3,
    title: "Почніть консультацію",
    text: "Підключайтесь на нашій платформі через вбудований відеозв'язок.",
  },
];

export function HowItWorksSection() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <h2 className="mb-12 font-display text-2xl leading-snug md:text-3xl">
          Як це працює
        </h2>
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step) => (
            <div key={step.title} className="flex flex-col gap-2 px-5 py-8 md:px-6">
              <span className="text-5xl leading-none font-bold text-ink-muted/25 md:text-6xl">
                {step.n}
              </span>
              <h3 className="mt-2 font-semibold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
