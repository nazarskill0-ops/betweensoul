import { DashboardShell } from "@/features/psychologist-dashboard/components/DashboardShell";

export default function PsychologistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
