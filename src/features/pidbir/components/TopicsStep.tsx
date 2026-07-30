"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TOPIC_GROUPS } from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import { topicsStepSchema, type TopicsStepValues } from "../schema";
import { PrimaryButton, StepShell } from "./WizardChrome";

export function TopicsStep() {
  const { topics, setTopics, goTo } = usePidbirStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TopicsStepValues>({
    resolver: zodResolver(topicsStepSchema),
    defaultValues: { topics },
  });

  const selected = watch("topics") ?? [];

  function onSubmit(values: TopicsStepValues) {
    setTopics(values.topics);
    goTo("structure");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StepShell
        title="Що хочеться обговорити?"
        hint="Оберіть скільки завгодно тем — за ними шукатимемо збіг"
        onBack={() => goTo("service")}
        footer={
          <PrimaryButton disabled={selected.length === 0}>
            {selected.length > 0 ? `Далі · обрано ${selected.length}` : "Далі"}
          </PrimaryButton>
        }
      >
        <div className="flex flex-col gap-6">
          {TOPIC_GROUPS.map((group) => (
            <fieldset key={group.group} className="flex flex-col gap-3">
              <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                {group.group}
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.topics.map((topic) => {
                  const isSelected = selected.includes(topic);
                  return (
                    <label
                      key={topic}
                      className={`cursor-pointer rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors focus-within:border-sage hover:border-sage ${
                        isSelected
                          ? "border-sage bg-sage-light text-sage"
                          : "border-sand-dark bg-white text-ink"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        value={topic}
                        {...register("topics")}
                      />
                      {topic}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {errors.topics && (
          <p className="text-sm font-medium text-rose">{errors.topics.message}</p>
        )}
      </StepShell>
    </form>
  );
}
