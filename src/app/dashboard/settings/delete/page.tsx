import { DeleteAccountView } from "@/features/dashboard/components/DeleteAccountView";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function DeleteAccountPage() {
  return (
    <SettingsSubPageShell title="Видалення профілю">
      <DeleteAccountView />
    </SettingsSubPageShell>
  );
}
