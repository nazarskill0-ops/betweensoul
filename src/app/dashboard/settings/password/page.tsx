import { ChangePasswordForm } from "@/features/dashboard/components/ChangePasswordForm";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function ChangePasswordPage() {
  return (
    <SettingsSubPageShell title="Змінити пароль">
      <ChangePasswordForm />
    </SettingsSubPageShell>
  );
}
