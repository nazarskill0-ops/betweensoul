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

const OFFERINGS = [
  {
    title: "Реальні клієнти без самостійного пошуку",
    text: "Ми знаходимо й приводимо клієнтів через власні канали — вам не потрібно вести рекламу чи шукати запити самостійно.",
  },
  {
    title: "Автоматизований розклад і бронювання",
    text: "Самі керуєте своєю доступністю — відкриваєте й закриваєте слоти в кабінеті у будь-який момент.",
  },
  {
    title: "Безпечна оплата напряму на ваш рахунок",
    text: "Клієнт оплачує сесію на платформі, кошти надходять вам наступного робочого дня.",
  },
  {
    title: "Безкоштовна реєстрація назавжди",
    text: "Жодних підписок, авансів чи прихованих платежів за розміщення профілю.",
  },
];

export function OfferingsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <h2 className="mb-12 text-center font-bold text-2xl leading-snug md:text-3xl">
          Що ми пропонуємо
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {OFFERINGS.map((item) => (
            <div key={item.title}>
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
