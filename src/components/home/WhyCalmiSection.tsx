import {
  CheckFeatureGrid,
  type Feature,
} from "@/components/marketing/CheckFeatureGrid";

const REASONS: readonly Feature[] = [
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
];

export function WhyCalmiSection() {
  return <CheckFeatureGrid title="Чому обирають Calmi" features={REASONS} />;
}
