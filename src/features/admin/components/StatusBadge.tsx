import {
  PSYCHOLOGIST_STATUSES,
  type PsychologistStatus,
} from "@/features/psychologists/schema";

const STATUS_CLASSES: Record<PsychologistStatus, string> = {
  pending: "bg-sand text-ink-muted",
  approved: "bg-sage-light text-sage",
  rejected: "bg-rose/10 text-rose",
};

const STATUS_LABELS = Object.fromEntries(
  PSYCHOLOGIST_STATUSES.map((s) => [s.value, s.label])
) as Record<PsychologistStatus, string>;

export function StatusBadge({ status }: { status: PsychologistStatus }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
