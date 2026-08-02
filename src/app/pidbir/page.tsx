import { PidbirHeader } from "@/features/pidbir/components/PidbirHeader";
import { PidbirWizard } from "@/features/pidbir/components/PidbirWizard";

export const metadata = { title: "Підбір спеціаліста — Calmi" };

export default function PidbirPage() {
  return (
    // Білий фон, як у каталозі: результат — це той самий список карток.
    <div className="min-h-dvh bg-white">
      {/* Глобальні хедер і футер тут не рендеряться (chromeless-routes). */}
      <PidbirHeader />

      {/*
        Ширину й відступи задає сам візард: анкета вужча за результат, а
        результат починається липкою шапкою впритул до хедера.
      */}
      <main>
        <PidbirWizard />
      </main>
    </div>
  );
}
