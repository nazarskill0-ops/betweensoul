import { NotificationSettingsForm } from "@/features/dashboard/components/NotificationSettingsForm";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function NotificationSettingsPage() {
  return (
    <SettingsSubPageShell title="Налаштування сповіщень">
      <NotificationSettingsForm />
    </SettingsSubPageShell>
  );
}
