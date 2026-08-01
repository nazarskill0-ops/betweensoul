import { Logo } from "@/components/layout/logo";
import { PidbirWizard } from "@/features/pidbir/components/PidbirWizard";

export const metadata = { title: "Підбір спеціаліста — Calmi" };

export default function PidbirPage() {
  return (
    <div className="min-h-dvh bg-sand">
      {/*
        Глобальні хедер і футер на /pidbir не рендеряться (chromeless-routes),
        тож лого тут — єдиний шлях назад на головну.
      */}
      <header className="px-5 pt-6 md:px-8">
        <Logo />
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
        <PidbirWizard />
      </main>
    </div>
  );
}
