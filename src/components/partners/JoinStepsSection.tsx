const STEPS = [
  {
    title: "Заповніть анкету",
    time: "~15 хв",
    tags: ["Освіта", "Досвід", "Спеціалізація"],
  },
  {
    title: "Пройдіть верифікацію диплома",
    time: "1–3 дні",
    tags: ["Документи", "Перевірка"],
  },
  {
    title: "Налаштуйте профіль і розклад",
    time: "одразу",
    tags: ["Фото", "Опис", "Графік"],
  },
  {
    title: "Почніть приймати клієнтів",
    time: null,
    tags: [] as string[],
  },
];

export function JoinStepsSection() {
  return (
    <section id="how" className="border-t border-sand-dark px-5 md:px-12">
      <div className="mx-auto max-w-5xl py-20">
        <h2 className="mb-12 font-bold text-2xl leading-snug md:text-3xl">
          Як приєднатися
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light font-bold text-sage">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                {step.time && (
                  <p className="mt-0.5 text-sm text-ink-muted">{step.time}</p>
                )}
              </div>
              {step.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border-[1.5px] border-sand-dark px-3 py-1 text-xs text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
