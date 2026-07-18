import type { ReactNode } from "react";

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="ml-auto text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
