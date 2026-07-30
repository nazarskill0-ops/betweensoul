"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SERVICES, formatServiceLabel } from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import { serviceStepSchema, type ServiceStepValues } from "../schema";
import { OptionCard, PrimaryButton, StepShell } from "./WizardChrome";
import { CoupleIcon, SinglePersonIcon } from "./icons";

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  "Індивідуальна терапія": "Робота один на один із терапевтом",
  "Парна терапія": "Сесії для двох партнерів разом",
};

export function ServiceStep() {
  const { service, setService, goTo } = usePidbirStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceStepValues>({
    resolver: zodResolver(serviceStepSchema),
    defaultValues: { service: (service as ServiceStepValues["service"]) ?? undefined },
  });

  const selected = watch("service");

  function onSubmit(values: ServiceStepValues) {
    setService(values.service);
    goTo("topics");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepShell
        title="Кого шукаємо психолога?"
        hint="З цього почнемо — далі буде кілька коротких питань"
        footer={<PrimaryButton disabled={!selected}>Далі</PrimaryButton>}
      >
        <div className="flex flex-col gap-3">
          {SERVICES.map((item) => (
            <OptionCard
              key={item}
              type="radio"
              isSelected={selected === item}
              icon={
                item === "Парна терапія" ? (
                  <CoupleIcon className="h-5 w-5" />
                ) : (
                  <SinglePersonIcon className="h-5 w-5" />
                )
              }
              label={formatServiceLabel(item)}
              description={SERVICE_DESCRIPTIONS[item]}
              inputProps={{ value: item, ...register("service") }}
            />
          ))}
        </div>

        {errors.service && (
          <p className="text-sm font-medium text-rose">{errors.service.message}</p>
        )}
      </StepShell>
    </form>
  );
}
