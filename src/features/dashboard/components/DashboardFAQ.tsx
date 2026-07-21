import { FAQAccordion, type FAQItem } from "@/features/psychologists/components/FAQAccordion";

const DASHBOARD_FAQ_ITEMS: FAQItem[] = [
  {
    question: "Як переглянути мої майбутні сесії?",
    answer: "У розділі «Сесії» на вкладці «Майбутні» — там дата, час і статус кожного запису.",
  },
  {
    question: "Як скасувати або перенести сесію?",
    answer:
      "Натисніть «Деталі» біля потрібної сесії — там же можна скасувати запис безкоштовно не пізніше ніж за 24 години до початку.",
  },
  {
    question: "Як додати психолога в улюблені?",
    answer:
      "На сторінці психолога в каталозі є кнопка «додати в улюблені» — обрані фахівці з'являться в розділі «Улюблені психологи».",
  },
  {
    question: "Як змінити дані профілю чи пароль?",
    answer:
      "У розділі «Налаштування» — окремі пункти для редагування профілю, зміни пароля та пошти.",
  },
];

export function DashboardFAQ() {
  return (
    <FAQAccordion
      items={DASHBOARD_FAQ_ITEMS}
      title="Часті запитання"
      className=""
      titleClassName="sr-only"
    />
  );
}
