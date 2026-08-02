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

const REASONS = [
  {
    title: "Перевірені спеціалісти",
    text: "Кожен психолог підтверджує диплом і кваліфікацію перед публікацією профілю.",
  },
  {
    title: "Зручний онлайн-запис",
    text: "Обирайте вільний слот у календарі фахівця й бронюйте сесію за кілька кліків.",
  },
  {
    title: "Конфіденційність",
    text: "Особисті контакти лишаються приховані — все спілкування проходить через платформу.",
  },
  {
    title: "Підтримка на всіх етапах",
    text: "Допоможемо з вибором фахівця, оплатою чи технічними питаннями в будь-який момент.",
  },
] as const;

export function WhyCalmiSection() {
  return (
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-6xl py-24 md:py-[120px]">
        <h2 className="mb-12 text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:mb-16 md:text-4xl">
          Чому обирають Calmi
        </h2>
        <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-light text-sage">
                <CheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">{reason.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{reason.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
