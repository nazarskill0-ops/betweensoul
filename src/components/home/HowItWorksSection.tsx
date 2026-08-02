import {
  NumberedStepsSection,
  type Step,
} from "@/components/marketing/NumberedStepsSection";

const STEPS: readonly Step[] = [
  {
    title: "Оберіть психолога",
    text: "Фільтруйте за темою, методом, мовою і вартістю.",
  },
  {
    title: "Забронюйте час",
    text: "Оберіть слот та оплатіть сесію.",
  },
  {
    title: "Почніть консультацію",
    text: "Підключайтесь на нашій платформі через вбудований відеозв'язок.",
  },
];

export function HowItWorksSection() {
  return <NumberedStepsSection title="Як це працює" steps={STEPS} />;
}
