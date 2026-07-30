"use client";

import { useEffect } from "react";
import { usePidbirStore } from "@/stores/pidbir";
import { ProgressBar, StepTransition } from "./WizardChrome";
import { ServiceStep } from "./ServiceStep";
import { TopicsStep } from "./TopicsStep";
import { StyleStep } from "./StyleStep";
import { CriteriaStep } from "./CriteriaStep";
import { ResultsStep } from "./ResultsStep";

export function PidbirWizard() {
  const { step, withCriteria } = usePidbirStore();

  // Екрани різної висоти: після довгого списку тем короткий екран питання
  // інакше відкривався б прокрученим, із заголовком над видимою областю.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <ProgressBar step={step} withCriteria={withCriteria} />

      {/* key={step} перемонтовує вміст, щоб кожен екран програвав появу заново */}
      <StepTransition key={step}>
        {step === "service" && <ServiceStep />}
        {step === "topics" && <TopicsStep />}
        {step === "structure" && <StyleStep axis="structure" />}
        {step === "lead" && <StyleStep axis="lead" />}
        {step === "timeFocus" && <StyleStep axis="timeFocus" />}
        {step === "criteria" && <CriteriaStep />}
        {step === "results" && <ResultsStep />}
      </StepTransition>
    </div>
  );
}
