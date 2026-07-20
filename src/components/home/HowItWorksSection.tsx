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
    <section className="mx-auto max-w-5xl px-5 py-20 md:px-12">
      <h2 className="mb-12 font-display text-2xl leading-snug md:text-3xl">
        Як це працює
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="rounded-card border-[1.5px] border-sand-dark bg-white p-6"
          >
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-semibold text-white">
              {step.n}
            </div>
            <h3 className="mb-1.5 font-semibold text-ink">{step.title}</h3>
            <p className="text-sm text-ink-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
