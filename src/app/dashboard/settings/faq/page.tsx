import { DashboardFAQ } from "@/features/dashboard/components/DashboardFAQ";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function DashboardFAQPage() {
  return (
    <SettingsSubPageShell title="FAQ">
      <DashboardFAQ />
    </SettingsSubPageShell>
  );
}
