"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePidbirStore } from "@/stores/pidbir";
import { ProgressSteps } from "./WizardUI";
import { ProfileStep } from "./ProfileStep";
import { RequestStep } from "./RequestStep";
import { ResultsStep } from "./ResultsStep";

export function PidbirWizard() {
  const { step, profile, setProfile, goTo } = usePidbirStore();
  const { data: user, isLoading: isUserLoading } = useUser();

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

  // Залогіненому користувачу міні-логін не потрібен: беремо email та ім'я з
  // профілю й одразу переходимо до запиту.
  useEffect(() => {
    if (isUserLoading || !user || step !== "profile") return;
    setProfile({
      ...profile,
      email: user.email,
      name: profile.name || user.fullName,
    });
    goTo("request");
  }, [user, isUserLoading, step, profile, setProfile, goTo]);

  // Кроки різної висоти: без цього результат після довгої форми відкривався б
  // прокрученим до середини сторінки.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!isHydrated) {
    return <div className="h-96 animate-pulse rounded-card bg-white" />;
  }

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <ProgressSteps current={step} />

      {step === "profile" && <ProfileStep />}
      {step === "request" && <RequestStep />}
      {step === "results" && <ResultsStep />}
    </div>
  );
}
