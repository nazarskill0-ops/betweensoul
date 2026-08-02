/*
  Секція «як це працює»: заголовок + пронумеровані кроки великими sage-цифрами.
  Спільна для лендінгу клієнтів і лендінгу психологів — відрізняється лише
  копірайтом і кількістю колонок.
*/

export type Step = {
  title: string;
  text: string;
};

export function NumberedStepsSection({
  id,
  title,
  steps,
  className = "",
}: {
  id?: string;
  title: string;
  steps: readonly Step[];
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 md:px-12 ${className}`}>
      <div className="mx-auto max-w-6xl pt-10 pb-24 md:pb-[120px]">
        <h2 className="mb-12 text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:mb-16 md:text-4xl">
          {title}
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {steps.map((step, i) => (
            <div key={step.title} className="px-2">
              <span className="block text-[64px] leading-none font-extrabold text-sage">
                {i + 1}
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
