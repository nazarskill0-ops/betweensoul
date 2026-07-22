import { PAYOUT_STATUS_LABELS, type PayoutSession } from "../schema";

const STATUS_CLASSES: Record<PayoutSession["status"], string> = {
  paid: "bg-sage-light text-sage",
  pending: "bg-sand text-ink-muted",
  failed: "bg-rose/10 text-rose",
};

export function PayoutStatusBadge({ status }: { status: PayoutSession["status"] }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {PAYOUT_STATUS_LABELS[status]}
    </span>
  );
}
