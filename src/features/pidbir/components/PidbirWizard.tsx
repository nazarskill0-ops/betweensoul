"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePidbirStore, type PidbirStep } from "@/stores/pidbir";
import { ProgressSteps } from "./WizardUI";
import { RequestStep } from "./RequestStep";
import { ResultsStep } from "./ResultsStep";
import { AuthGateModal } from "./AuthGateModal";

/**
 * Скільки часу результат видно без пропозиції зареєструватись. Пауза
 * навмисна: спершу людина має побачити, що підбір справді щось знайшов.
 */
const AUTH_GATE_DELAY_MS = 2800;

export function PidbirWizard() {
  const { step, goTo, awaitingAuth, setAwaitingAuth, isGateDismissed, dismissGate } =
    usePidbirStore();
  const { data: user, isLoading: isUserLoading } = useUser();
  const [isGateVisible, setIsGateVisible] = useState(false);

  /*
    Стан анкети персиститься в localStorage, тож до регідратації store на
    клієнті його вміст не збігається з тим, що відрендерив сервер. Підписуємось
    на подію самого persist (а не просто на монтування) і до неї малюємо
    каркас — інакше React лається на неспівпадіння гідратації.
  */
  const isHydrated = useSyncExternalStore(
    (onChange) => usePidbirStore.persist.onFinishHydration(onChange),
    () => usePidbirStore.persist.hasHydrated(),
    () => false
  );

  /*
    Повернення з Google OAuth: анкета лишилась заповненою в localStorage, а
    сесія вже є — знімаємо очікування, результат просто лишається відкритим.
  */
  useEffect(() => {
    if (isUserLoading || !user || !awaitingAuth) return;
    setAwaitingAuth(false);
    goTo("results");
  }, [user, isUserLoading, awaitingAuth, setAwaitingAuth, goTo]);

  // Панель приходить не одразу з результатом, а через паузу. setState всередині
  // таймера, тож ефект лишається асинхронним.
  useEffect(() => {
    if (step !== "results" || !awaitingAuth || isUserLoading || user || isGateDismissed) {
      return;
    }
    const timer = setTimeout(() => setIsGateVisible(true), AUTH_GATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step, awaitingAuth, isUserLoading, user, isGateDismissed]);

  /** Анкета заповнена: результат показуємо всім, пропозиція приходить пізніше. */
  function handleRequestSubmitted() {
    if (!user) setAwaitingAuth(true);
    goTo("results");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function handleAuthenticated() {
    setAwaitingAuth(false);
    setIsGateVisible(false);
  }

  function handleProgressNavigate(target: PidbirStep) {
    setIsGateVisible(false);
    goTo(target);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  if (!isHydrated) {
    return <div className="h-96 animate-pulse rounded-card bg-white" />;
  }

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <ProgressSteps current={step} onNavigate={handleProgressNavigate} />

      {step === "request" && <RequestStep onSubmitted={handleRequestSubmitted} />}
      {step === "results" && <ResultsStep />}

      {isGateVisible && awaitingAuth && !user && !isGateDismissed && (
        <AuthGateModal
          onClose={() => {
            setIsGateVisible(false);
            // Закрили — більше не показуємо в цій сесії, навіть якщо
            // користувач повернеться до анкети й підбере ще раз.
            dismissGate();
          }}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
