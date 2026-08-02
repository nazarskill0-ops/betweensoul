"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePidbirStore, type PidbirStep } from "@/stores/pidbir";
import { ProgressSteps } from "./WizardUI";
import { RequestStep } from "./RequestStep";
import { PidbirResults } from "./PidbirResults";
import { AuthGateModal } from "./AuthGateModal";

/**
 * Скільки часу результат видно без пропозиції зареєструватись. Пауза
 * навмисна: спершу людина має побачити, що підбір справді щось знайшов.
 */
const AUTH_GATE_DELAY_MS = 2800;

export function PidbirWizard() {
  const { step, goTo, awaitingAuth, setAwaitingAuth } = usePidbirStore();
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
    if (step !== "results" || !awaitingAuth || isUserLoading || user) return;
    const timer = setTimeout(() => setIsGateVisible(true), AUTH_GATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step, awaitingAuth, isUserLoading, user]);

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
    return (
      <div className="mx-auto max-w-4xl px-5 py-8 md:py-12">
        <div className="h-96 animate-pulse rounded-card bg-white" />
      </div>
    );
  }

  const gate = isGateVisible && awaitingAuth && !user && (
    <AuthGateModal onAuthenticated={handleAuthenticated} />
  );

  const progress = <ProgressSteps current={step} onNavigate={handleProgressNavigate} />;

  /*
    Кроки самі задають свою ширину й відступи. Результат ширший за анкету
    (двоколонковий профіль психолога) і починається липкою шапкою впритул до
    хедера, тож спільної обгортки з padding тут бути не може.
  */
  if (step === "results") {
    return (
      <>
        <PidbirResults stepper={progress} />
        {gate}
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 md:gap-14 md:py-12">
      {progress}
      <RequestStep onSubmitted={handleRequestSubmitted} />
      {gate}
    </div>
  );
}
