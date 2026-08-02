const STEPS = [
  {
    n: 1,
    title: "Оберіть психолога",
    text: "Фільтруйте за темою, методом, мовою і вартістю.",
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
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-6xl pt-10 pb-24 md:pb-[120px]">
        <h2 className="mb-12 text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:mb-16 md:text-4xl">
          Як це працює
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="px-2">
              <span className="block text-[64px] leading-none font-extrabold text-sage">
                {step.n}
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2.5 leading-relaxed text-ink-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
