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

const REQUIREMENTS = [
  "Базова психологічна/психотерапевтична освіта (диплом спеціаліста, магістра чи еквівалент)",
  "Діючий ФОП (будь-яка група) або готовність відкрити",
  "Готовність пройти верифікацію диплома перед публікацією профілю",
];

export function RequirementsSection() {
  return (
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-6xl py-24 md:pt-[110px] md:pb-[100px]">
        <h2 className="font-display text-2xl leading-snug font-extrabold tracking-tight md:text-3xl">
          Вимоги до психологів
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          Ми публікуємо профіль лише після перевірки — це те, що робить каталог
          вартим довіри для клієнтів.
        </p>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REQUIREMENTS.map((text) => (
            <li
              key={text}
              className="flex gap-4 rounded-card border-[1.5px] border-sand-dark px-6 py-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage">
                <CheckIcon className="h-4 w-4" />
              </span>
              <span className="leading-relaxed text-ink">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
