"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePidbirStore, type PidbirProgressStep } from "@/stores/pidbir";
import { ProgressSteps } from "./WizardUI";
import {
  REQUEST_SECTION_ID,
  STYLE_SECTION_ID,
  RequestStep,
} from "./RequestStep";
import { ResultsStep } from "./ResultsStep";
import { AuthGateModal } from "./AuthGateModal";

/**
 * Скільки часу результат видно без модалки. Пауза навмисна: спершу людина має
 * побачити, що підбір справді щось знайшов, і лише потім отримати пропозицію
 * зареєструватись.
 */
const AUTH_GATE_DELAY_MS = 2800;

/** Частка висоти екрана, після якої блок стилю вважається активним. */
const STYLE_SECTION_ACTIVATION = 0.45;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PidbirWizard() {
  const { step, goTo, awaitingAuth, setAwaitingAuth } = usePidbirStore();
  const { data: user, isLoading: isUserLoading } = useUser();

  /** Яка половина анкети зараз на екрані — підсвічує сегмент прогресу. */
  const [activeSection, setActiveSection] = useState<"request" | "style">("request");
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

  // Прогрес йде за скролом: анкета лишається однією сторінкою, але смуга
  // заповнюється, коли користувач доходить до питань про стиль.
  useEffect(() => {
    if (step !== "request") return;

    const onScroll = () => {
      const el = document.getElementById(STYLE_SECTION_ID);
      if (!el) return;
      const isStyleReached =
        el.getBoundingClientRect().top <= window.innerHeight * STYLE_SECTION_ACTIVATION;
      setActiveSection(isStyleReached ? "style" : "request");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [step]);

  /*
    Повернення з Google OAuth: анкета лишилась заповненою в localStorage, а
    сесія вже є — знімаємо очікування, і результат просто лишається відкритим.
  */
  useEffect(() => {
    if (isUserLoading || !user || !awaitingAuth) return;
    setAwaitingAuth(false);
    goTo("results");
  }, [user, isUserLoading, awaitingAuth, setAwaitingAuth, goTo]);

  // Модалка приходить не одразу з результатом, а через паузу — див.
  // AUTH_GATE_DELAY_MS. setState всередині таймера, тож ефект не синхронний.
  useEffect(() => {
    if (step !== "results" || !awaitingAuth || isUserLoading || user) return;
    const timer = setTimeout(() => setIsGateVisible(true), AUTH_GATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step, awaitingAuth, isUserLoading, user]);

  const progressStep: PidbirProgressStep =
    step === "results" ? "results" : activeSection;

  /** Анкета заповнена: результат показуємо всім, ворота приходять пізніше. */
  function handleRequestSubmitted() {
    if (!user) setAwaitingAuth(true);
    goTo("results");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function handleAuthenticated() {
    setAwaitingAuth(false);
    setIsGateVisible(false);
  }

  function handleProgressNavigate(target: PidbirProgressStep) {
    if (target === "results") return;

    if (step === "results") {
      setAwaitingAuth(false);
      setIsGateVisible(false);
      goTo("request");
      // Секція існує лише після перемальовування кроку.
      requestAnimationFrame(() =>
        scrollToSection(target === "style" ? STYLE_SECTION_ID : REQUEST_SECTION_ID)
      );
      return;
    }

    scrollToSection(target === "style" ? STYLE_SECTION_ID : REQUEST_SECTION_ID);
  }

  if (!isHydrated) {
    return <div className="h-96 animate-pulse rounded-card bg-white" />;
  }

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <ProgressSteps current={progressStep} onNavigate={handleProgressNavigate} />

      {step === "request" && <RequestStep onSubmitted={handleRequestSubmitted} />}
      {step === "results" && <ResultsStep />}

      {isGateVisible && awaitingAuth && !user && (
        <AuthGateModal
          onClose={() => {
            setIsGateVisible(false);
            setAwaitingAuth(false);
          }}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
