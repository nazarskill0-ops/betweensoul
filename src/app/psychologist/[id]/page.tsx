import { AppHeader } from "@/components/layout/AppHeader";
import { PsychologistProfileView } from "@/features/psychologists/components/PsychologistProfileView";

export default async function PsychologistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <PsychologistProfileView id={id} />
      </main>
    </>
  );
}
