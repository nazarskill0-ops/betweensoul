"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePidbirStore } from "@/stores/pidbir";
import { ProgressSteps } from "./WizardUI";
import { RequestStep } from "./RequestStep";
import { ResultsStep } from "./ResultsStep";
import { AuthGateModal } from "./AuthGateModal";

export function PidbirWizard() {
  const { step, goTo, awaitingAuth, setAwaitingAuth } = usePidbirStore();
  const { data: user, isLoading: isUserLoading } = useUser();

  /*
    Видимість модалки не тримаємо окремим стейтом — вона повністю виводиться
    зі стану: анкета заповнена (awaitingAuth) і користувач ще гість. Тоді й
    закривати її вручну після входу не треба, і в ефекті нижче немає зайвого
    setState.
  */
  const isAuthModalOpen = awaitingAuth && !isUserLoading && !user;

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
    сесія вже є — відкриваємо результат одразу, не змушуючи тиснути
    «Підібрати фахівця» вдруге.
  */
  useEffect(() => {
    if (isUserLoading || !user || !awaitingAuth) return;
    setAwaitingAuth(false);
    goTo("results");
  }, [user, isUserLoading, awaitingAuth, setAwaitingAuth, goTo]);

  // Кроки різної висоти: без цього результат після довгої форми відкривався б
  // прокрученим до середини сторінки.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /**
   * Анкета заповнена. Результат бачать лише авторизовані — гостю замість
   * редіректу показуємо модалку поверх сторінки.
   */
  function handleRequestSubmitted() {
    if (user) {
      goTo("results");
      return;
    }
    setAwaitingAuth(true);
  }

  function handleAuthenticated() {
    setAwaitingAuth(false);
    goTo("results");
  }

  if (!isHydrated) {
    return <div className="h-96 animate-pulse rounded-card bg-white" />;
  }

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <ProgressSteps current={step} onNavigate={goTo} />

      {step === "request" && <RequestStep onSubmitted={handleRequestSubmitted} />}
      {step === "results" && <ResultsStep />}

      {isAuthModalOpen && (
        <AuthGateModal
          onClose={() => setAwaitingAuth(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
