import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function DashboardLayout({
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
