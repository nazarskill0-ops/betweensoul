"use client";

import { useState } from "react";
import {
  GENDERS,
  SPECIALIZATIONS,
  TOPIC_GROUPS,
} from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import {
  AUDIENCE_OPTIONS,
  PSYCHOLOGIST_AGE_GROUPS,
  STYLE_QUESTIONS,
  TOPICS_VISIBLE_LIMIT,
  type PsychologistAgeGroup,
  type StyleValue,
} from "../schema";
import {
  SectionRow,
  SelectablePill,
  SubmitButton,
  ToggleGroup,
  TopicCheckbox,
} from "./WizardUI";

/** Група тем: довгі списки згорнуті до перших шести. */
function TopicGroup({
  group,
  topics,
  selected,
  onToggle,
}: {
  group: string;
  topics: readonly string[];
  selected: string[];
  onToggle: (topic: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hidden = topics.length - TOPICS_VISIBLE_LIMIT;
  const visible = isExpanded ? topics : topics.slice(0, TOPICS_VISIBLE_LIMIT);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-1 font-semibold text-ink">{group}</h3>
      <div className="grid gap-x-8 sm:grid-cols-2">
        {visible.map((topic) => (
          <TopicCheckbox
            key={topic}
            label={topic}
            isSelected={selected.includes(topic)}
            onToggle={() => onToggle(topic)}
          />
        ))}
      </div>
      {hidden > 0 && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-1 self-start text-sm font-medium text-sage transition-colors hover:text-sage/80"
        >
          Ще {hidden}
        </button>
      )}
    </div>
  );
}

export function RequestStep() {
  const {
    request,
    withCriteria,
    setService,
    toggleTopic,
    setStyleAnswer,
    setWithCriteria,
    setGender,
    setAgeGroup,
    toggleMethod,
    goTo,
  } = usePidbirStore();

  const [showErrors, setShowErrors] = useState(false);

  const isStyleComplete = STYLE_QUESTIONS.every((q) => request.style[q.axis]);
  const hasTopics = request.topics.length > 0;
  const isValid = hasTopics && isStyleComplete;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    goTo("results");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-12">
      <SectionRow title="Для кого шукаєте психолога">
        <ToggleGroup
          ariaLabel="Для кого шукаєте психолога"
          options={AUDIENCE_OPTIONS}
          value={request.service}
          onChange={setService}
        />
      </SectionRow>

      <SectionRow title="Що хотіли б обговорити з психологом?">
        <div className="flex flex-col gap-7">
          {TOPIC_GROUPS.map((g) => (
            <TopicGroup
              key={g.group}
              group={g.group}
              topics={g.topics}
              selected={request.topics}
              onToggle={toggleTopic}
            />
          ))}
          {showErrors && !hasTopics && (
            <p className="text-sm text-rose">Оберіть хоча б одну тему</p>
          )}
        </div>
      </SectionRow>

      <SectionRow title="Який стиль терапії вам ближчий?">
        <div className="flex flex-col gap-6">
          {STYLE_QUESTIONS.map((question) => (
            <div key={question.axis} className="flex flex-col gap-2.5">
              <h3 className="font-semibold text-ink">{question.title}</h3>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <SelectablePill
                    key={option.value}
                    label={option.label}
                    isSelected={request.style[question.axis] === option.value}
                    onClick={() =>
                      setStyleAnswer(question.axis, option.value as StyleValue)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          {showErrors && !isStyleComplete && (
            <p className="text-sm text-rose">
              Дайте відповідь на всі три питання про стиль
            </p>
          )}
        </div>
      </SectionRow>

      <SectionRow title="Додаткові критерії">
        <div className="flex flex-col gap-6">
          <ToggleGroup
            ariaLabel="Додаткові критерії"
            options={[
              { value: "none", label: "Немає переваг" },
              { value: "custom", label: "Уточнити критерії" },
            ]}
            value={withCriteria ? "custom" : "none"}
            onChange={(v) => setWithCriteria(v === "custom")}
          />

          {withCriteria && (
            <div className="flex flex-col gap-6 rounded-card border-[1.5px] border-sand-dark bg-white p-5 md:p-6">
              <div className="flex flex-col gap-2.5">
                <h3 className="font-semibold text-ink">Стать психолога</h3>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <SelectablePill
                      key={g.value}
                      label={g.label}
                      isSelected={request.gender === g.value}
                      // Повторний клік знімає вибір — критерій необов'язковий.
                      onClick={() =>
                        setGender(request.gender === g.value ? null : g.value)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <h3 className="font-semibold text-ink">Вікова група психолога</h3>
                <div className="flex flex-wrap gap-2">
                  {PSYCHOLOGIST_AGE_GROUPS.map((group) => (
                    <SelectablePill
                      key={group.value}
                      label={group.label}
                      isSelected={request.ageGroup === group.value}
                      onClick={() =>
                        setAgeGroup(
                          request.ageGroup === group.value
                            ? null
                            : (group.value as PsychologistAgeGroup)
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <h3 className="font-semibold text-ink">Метод роботи</h3>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((method) => (
                    <SelectablePill
                      key={method}
                      label={method}
                      isSelected={request.methods.includes(method)}
                      onClick={() => toggleMethod(method)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionRow>

      {/* Єдина кнопка кроку — поруч навмисно нічого рівнозначного. */}
      <div className="grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
        <span className="hidden md:block" />
        <SubmitButton>Підібрати фахівця</SubmitButton>
      </div>
    </form>
  );
}
