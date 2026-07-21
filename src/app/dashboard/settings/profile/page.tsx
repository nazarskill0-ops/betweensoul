import { EditProfileForm } from "@/features/dashboard/components/EditProfileForm";
import { SettingsSubPageShell } from "@/features/dashboard/components/SettingsSubPageShell";

export default function EditProfilePage() {
  return (
    <SettingsSubPageShell title="Редагувати профіль">
      <EditProfileForm />
    </SettingsSubPageShell>
  );
}
