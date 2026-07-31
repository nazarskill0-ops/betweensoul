import { PidbirWizard } from "@/features/pidbir/components/PidbirWizard";

export const metadata = { title: "Підбір спеціаліста — Calmi" };

export default function PidbirPage() {
  return (
    <div className="min-h-dvh bg-sand">
      <main className="mx-auto max-w-4xl px-5 py-10 md:py-14">
        <PidbirWizard />
      </main>
    </div>
  );
}
