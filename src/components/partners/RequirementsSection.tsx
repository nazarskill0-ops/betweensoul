function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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
    <section className="border-t border-sand-dark px-5 md:px-12">
      <div className="mx-auto max-w-5xl py-20">
        <h2 className="mb-10 font-bold text-2xl leading-snug md:text-3xl">
          Вимоги до психологів
        </h2>
        <ul className="flex max-w-2xl flex-col gap-4">
          {REQUIREMENTS.map((text) => (
            <li key={text} className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
              <span className="text-ink">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
