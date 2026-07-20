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
    <section className="mx-auto max-w-5xl px-5 py-20 md:px-12">
      <h2 className="mb-12 font-display text-2xl leading-snug md:text-3xl">
        Чому обирають Calmi
      </h2>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {REASONS.map((reason) => (
          <div key={reason.title}>
            <h3 className="flex items-center gap-2 font-semibold text-ink">
              <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
              {reason.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-muted">{reason.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
