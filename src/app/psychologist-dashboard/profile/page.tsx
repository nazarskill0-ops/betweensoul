import { ProfileEditForm } from "@/features/psychologist-dashboard/components/ProfileEditForm";

export default function PsychologistProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Мій профіль</h1>
      <ProfileEditForm />
    </div>
  );
}
