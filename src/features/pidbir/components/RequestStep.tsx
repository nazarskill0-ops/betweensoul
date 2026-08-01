"use client";

import { useState } from "react";
import {
  COUPLE_THERAPY_SERVICE,
  GENDERS,
  SPECIALIZATIONS,
  TOPIC_GROUPS,
} from "@/features/psychologists/schema";
import { usePidbirStore } from "@/stores/pidbir";
import {
  AUDIENCE_OPTIONS,
  COUPLE_TOPIC_GROUPS,
  STYLE_QUESTIONS,
  TOPICS_VISIBLE_LIMIT,
  type StyleValue,
} from "../schema";
import {
  SectionRow,
  SelectablePill,
  SubmitButton,
  ToggleGroup,
  TopicCheckbox,
} from "./WizardUI";

/*
  Якорі половин анкети. За ними прогрес-бар розуміє, у якій частині форми
  зараз користувач, і за ними ж прокручує, коли на сегмент клікають.
*/
export const REQUEST_SECTION_ID = "pidbir-request";
export const STYLE_SECTION_ID = "pidbir-style";

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

export function RequestStep({ onSubmitted }: { onSubmitted: () => void }) {
  const {
    request,
    withCriteria,
    setService,
    toggleTopic,
    setStyleAnswer,
    setWithCriteria,
    setGender,
    toggleMethod,
  } = usePidbirStore();

  const [showErrors, setShowErrors] = useState(false);

  // Запит пари — про те, що відбувається між двома, тож і список тем інший.
  const isCouple = request.service === COUPLE_THERAPY_SERVICE;
  const topicGroups = isCouple
    ? COUPLE_TOPIC_GROUPS.map((g) => ({
        group: g.group,
        topics: g.topics.map((t) => t.label),
      }))
    : TOPIC_GROUPS.map((g) => ({ group: g.group, topics: [...g.topics] }));

  const isStyleComplete = STYLE_QUESTIONS.every((q) => request.style[q.axis]);
  const hasTopics = request.topics.length > 0;
  const isValid = hasTopics && isStyleComplete;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    // Куди йти далі, вирішує візард: результат бачать лише авторизовані.
    onSubmitted();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-12">
      <div id={REQUEST_SECTION_ID} className="scroll-mt-28" />

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
          {topicGroups.map((g) => (
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

      <div id={STYLE_SECTION_ID} className="scroll-mt-28" />

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

              {/*
                Фільтр за віковою групою психолога свідомо не показуємо: при
                десятку опублікованих спеціалістів він разом зі статтю й
                методом надто часто зводив би видачу до нуля. Усе під ним —
                PSYCHOLOGIST_AGE_GROUPS у schema.ts, поле `ageGroup` і
                isInAgeGroup() у matching.ts — лишилось робочим, тож повернути
                блок можна одним <SelectablePill>-списком, коли психологів
                стане більше.
              */}

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
