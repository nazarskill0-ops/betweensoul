import { ChangeEmailForm } from "@/features/dashboard/components/ChangeEmailForm";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function ChangeEmailPage() {
  return (
    <SettingsSubPageShell title="Змінити пошту">
      <ChangeEmailForm />
    </SettingsSubPageShell>
  );
}
