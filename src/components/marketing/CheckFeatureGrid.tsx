/*
  Сітка переваг: кругла галочка на sage-light + заголовок і текст.
  Спільна для «Чому обирають Calmi» (клієнти) і «Що ми пропонуємо» (психологи).
*/

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export type Feature = {
  title: string;
  text: string;
};

export function CheckFeatureGrid({
  title,
  features,
  className = "",
}: {
  title: string;
  features: readonly Feature[];
  className?: string;
}) {
  return (
    <section className={`px-5 md:px-12 ${className}`}>
      <div className="mx-auto max-w-6xl py-24 md:py-[120px]">
        <h2 className="mb-12 text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:mb-16 md:text-4xl">
          {title}
        </h2>
        <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage">
                <CheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
