import {
  NumberedStepsSection,
  type Step,
} from "@/components/marketing/NumberedStepsSection";

const STEPS: readonly Step[] = [
  {
    title: "Заповніть анкету",
    text: "Освіта, досвід і спеціалізація — близько 15 хвилин.",
  },
  {
    title: "Пройдіть верифікацію",
    text: "Перевіряємо диплом і документи про кваліфікацію за 1–3 робочі дні.",
  },
  {
    title: "Налаштуйте профіль",
    text: "Додайте фото, опис і власний графік — розклад лишається за вами.",
  },
  {
    title: "Починайте приймати",
    text: "Клієнти бронюють вільні слоти й оплачують сесію на платформі.",
  },
];

export function JoinStepsSection() {
  return <NumberedStepsSection id="how" title="Як це працює" steps={STEPS} />;
}
