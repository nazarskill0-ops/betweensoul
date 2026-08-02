import { FAQAccordion, type FAQItem } from "@/features/psychologists/components/FAQAccordion";

// TODO(content): фінальний текст відповідей ще узгоджується.
const PARTNER_FAQ_ITEMS: FAQItem[] = [
  {
    question: "Яка комісія платформи?",
    answer:
      "Платформа бере невелику комісію з кожної оплаченої сесії. Точні умови уточнюємо перед стартом і повідомимо заздалегідь.",
  },
  {
    question: "Коли я отримую оплату?",
    answer:
      "Виплати надходять на ваш рахунок автоматично, наступного робочого дня після проведеної сесії.",
  },
  {
    question: "Які документи потрібні для верифікації?",
    answer:
      "Диплом про психологічну чи психотерапевтичну освіту та документи, що підтверджують кваліфікацію. Повний перелік узгодимо особисто після подання анкети.",
  },
  {
    question: "Чи можу я сам керувати розкладом?",
    answer:
      "Так. Ви самостійно відкриваєте й закриваєте слоти у своєму кабінеті — без обов'язкових годин чи погоджень.",
  },
  {
    question: "Скільки часу займає перевірка анкети?",
    answer: "Зазвичай 1–3 робочих дні з моменту подання анкети та документів.",
  },
];

export function PartnerFAQSection() {
  return (
    <section className="px-5 md:px-12">
      <div className="mx-auto max-w-3xl pb-20 md:pb-24">
        <FAQAccordion
          items={PARTNER_FAQ_ITEMS}
          title="Часті запитання"
          className="gap-8"
          titleClassName="text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:text-[34px]"
        />
      </div>
    </section>
  );
}
