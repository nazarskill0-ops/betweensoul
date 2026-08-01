import { PidbirHeader } from "@/features/pidbir/components/PidbirHeader";
import { PidbirWizard } from "@/features/pidbir/components/PidbirWizard";

export const metadata = { title: "Підбір спеціаліста — Calmi" };

export default function PidbirPage() {
  return (
    // Білий фон, як у каталозі: результат — це той самий список карток.
    <div className="min-h-dvh bg-white">
      {/* Глобальні хедер і футер тут не рендеряться (chromeless-routes). */}
      <PidbirHeader />

      <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
        <PidbirWizard />
      </main>
    </div>
  );
}
