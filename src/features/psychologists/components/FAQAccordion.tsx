"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Як проходить сесія?",
    answer:
      "Сесія триває 50 хвилин і проходить онлайн через відеозв'язок прямо на платформі Calmi — окремий застосунок не потрібен.",
  },
  {
    question: "Як відбувається оплата?",
    answer:
      "Оплата — онлайн, одразу при бронюванні слота. Кошти захищені платформою і надходять психологу після проведеної сесії.",
  },
  {
    question: "Чи можна перенести або скасувати сесію?",
    answer:
      "Так, безкоштовно — якщо зробити це не пізніше ніж за 24 години до початку сесії. При скасуванні пізніше або неявці кошти не повертаються.",
  },
  {
    question: "Що робити, якщо психолог мені не підійде?",
    answer:
      "Це нормально — терапія працює тільки коли є контакт. Ви можете в будь-який момент обрати іншого спеціаліста з каталогу без пояснень.",
  },
  {
    question: "Чи конфіденційна інформація про мої сесії?",
    answer:
      "Так. Дані сесій захищені, а психолог не бачить ваших особистих контактів — усе спілкування й бронювання проходить через платформу.",
  },
];

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-2xl text-ink">Часті питання</h2>

      <div className="flex flex-col divide-y divide-sand-dark">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.question} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="font-medium text-ink">{item.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 shrink-0 text-ink-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="mt-3 text-sm text-ink-muted">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
