import type { ClientSession } from "../schema";

const STATUS_LABELS: Record<ClientSession["status"], string> = {
  confirmed: "Підтверджено",
  pending_payment: "Очікує оплати",
  completed: "Завершено",
  cancelled: "Скасовано",
};

const STATUS_CLASSES: Record<ClientSession["status"], string> = {
  confirmed: "bg-sage-light text-sage",
  pending_payment: "bg-rose/10 text-rose",
  completed: "bg-sand text-ink-muted",
  cancelled: "bg-rose/10 text-rose",
};

export function SessionStatusBadge({ status }: { status: ClientSession["status"] }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
