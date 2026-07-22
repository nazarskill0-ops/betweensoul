"use client";

import { useEffect, useMemo, useState } from "react";
import { LANGUAGES, QUALIFICATIONS, type PsychologistProfile } from "../schema";
import { INDIVIDUAL_SESSION_DURATION_MINUTES } from "../utils/availabilityStore";
import {
  combineDateAndTime,
  findNearestFreeDay,
  toLocalDateIso,
  type SlotServiceType,
} from "../utils/generateFakeSlots";
import { formatSlotRange } from "../utils/formatSlotRange";
import { formatAge, formatExperienceYears, formatSessionsCountBadge } from "../utils/formatters";
import { BriefcaseIcon, CheckIcon, ClockIcon, CloseIcon, GlobeIcon, PersonIcon } from "./icons";
import { InfoRow } from "./InfoRow";
import { NearestTimeWidget } from "./NearestTimeWidget";
import { ServiceTypeDropdown } from "./ServiceTypeDropdown";

function CompactInfoSummary({
  psychologist,
  languageLabels,
}: {
  psychologist: PsychologistProfile;
  languageLabels: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card bg-sand p-3">
      <InfoRow
        icon={<PersonIcon className="h-4 w-4 shrink-0 text-sage" />}
        label="Вік"
        value={formatAge(psychologist.age)}
      />
      {psychologist.experienceYears !== null && (
        <InfoRow
          icon={<BriefcaseIcon className="h-4 w-4 shrink-0 text-sage" />}
          label="Досвід"
          value={formatExperienceYears(psychologist.experienceYears)}
        />
      )}
      {languageLabels.length > 0 && (
        <InfoRow
          icon={<GlobeIcon className="h-4 w-4 shrink-0 text-sage" />}
          label="Мова"
          value={languageLabels.join(", ")}
        />
      )}
    </div>
  );
}

export function PsychologistSidebarCard({
  psychologist,
  serviceType,
  onServiceTypeChange,
}: {
  psychologist: PsychologistProfile;
  serviceType: SlotServiceType;
  onServiceTypeChange: (type: SlotServiceType) => void;
}) {
  const hasCoupleTherapy = psychologist.couplePriceMinor !== null;
  const activeDurationMinutes =
    serviceType === "couple"
      ? (psychologist.coupleSessionDurationMinutes ?? INDIVIDUAL_SESSION_DURATION_MINUTES)
      : INDIVIDUAL_SESSION_DURATION_MINUTES;
  const activePriceMinor =
    serviceType === "couple"
      ? (psychologist.couplePriceMinor ?? psychologist.priceMinor)
      : psychologist.priceMinor;
  const activePriceUah = activePriceMinor / 100;

  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;
  const sessionsBadge = formatSessionsCountBadge(psychologist.sessionsCount);

  const [isGeneralInfoVisible, setIsGeneralInfoVisible] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const languageLabels: string[] = psychologist.languages
    .map((code) => LANGUAGES.find((l) => l.value === code)?.label)
    .filter((label): label is NonNullable<typeof label> => label !== undefined);

  const nearestDay = useMemo(
    () => findNearestFreeDay(serviceType, psychologist.profileId),
    [serviceType, psychologist.profileId]
  );

  useEffect(() => {
    const target = document.getElementById("general-info");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsGeneralInfoVisible(entry.isIntersecting),
      { rootMargin: "-96px 0px 0px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleServiceTypeChange = (type: SlotServiceType) => {
    onServiceTypeChange(type);
    setSelectedTime(null);
  };

  const handleMainButtonClick = () => {
    if (selectedTime) {
      setIsConfirmModalOpen(true);
    } else {
      scrollToBooking();
    }
  };

  const handlePayment = () => {
    if (!nearestDay || !selectedTime) return;
    // eslint-disable-next-line no-console
    console.log("Payment initiated:", {
      psychologistId: psychologist.profileId,
      serviceType,
      date: toLocalDateIso(nearestDay.date),
      time: selectedTime,
      durationMinutes: activeDurationMinutes,
      priceMinor: activePriceMinor,
    });
  };

  return (
    <div className="flex max-h-[calc(100vh-7.5rem)] flex-col gap-3 rounded-card bg-white p-5">
      <div className="h-[300px] shrink-0 overflow-hidden rounded-xl">
        {psychologist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={psychologist.avatarUrl}
            alt={psychologist.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-sage-light" />
        )}
      </div>

      <div className="mt-3 flex shrink-0 items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold leading-tight text-ink">
            {psychologist.fullName}
          </h1>
          {qualificationLabel && (
            <span className="text-sm text-ink-muted">{qualificationLabel}</span>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right text-sm leading-tight text-ink-muted">
          <span className="flex items-center gap-1">
            <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
            Підтверджений диплом
          </span>
          {sessionsBadge && (
            <span className="flex items-center gap-1">
              <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
              {sessionsBadge} проведених сесій
            </span>
          )}
          <span className="flex items-center gap-1 font-bold">
            <ClockIcon className="h-4 w-4 shrink-0 text-sage" />
            {activeDurationMinutes} хв · {activePriceUah} ₴
          </span>
        </div>
      </div>

      {isGeneralInfoVisible && hasCoupleTherapy && (
        <div className="shrink-0">
          <ServiceTypeDropdown serviceType={serviceType} onServiceTypeChange={handleServiceTypeChange} />
        </div>
      )}

      {/*
        Обидва варіанти лишаються змонтованими постійно — вмикаємо/вимикаємо
        через клас display:none. Умовний рендер РІЗНИХ типів компонентів тут
        змушував React повністю демонтувати/монтувати DOM при кожному
        спрацюванні IntersectionObserver, що й було справжньою причиною лагу.
        Обгортка — flex-1 min-h-0 overflow-y-auto: якщо вміст не влазить у
        видиму висоту картки, скролиться саме цей блок, а не кнопка нижче.
      */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={isGeneralInfoVisible ? "" : "hidden"}>
          <NearestTimeWidget
            nearestDay={nearestDay}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            durationMinutes={activeDurationMinutes}
          />
        </div>
        <div className={isGeneralInfoVisible ? "hidden" : ""}>
          <CompactInfoSummary psychologist={psychologist} languageLabels={languageLabels} />
        </div>
      </div>

      {isGeneralInfoVisible && (
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`w-full shrink-0 rounded-full px-6 py-3 text-sm font-medium text-sand transition-colors ${
            selectedTime ? "bg-sage hover:bg-sage/90" : "bg-ink hover:bg-sage"
          }`}
        >
          {selectedTime ? "Забронювати" : "Обрати час"}
        </button>
      )}

      {isConfirmModalOpen && nearestDay && selectedTime && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-card bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              aria-label="Закрити"
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <h3 className="font-display text-xl text-ink">Підтвердження бронювання</h3>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Психолог</span>
                <span className="font-medium text-ink">{psychologist.fullName}</span>
              </div>
              {hasCoupleTherapy && (
                <div className="flex justify-between gap-3">
                  <span className="text-ink-muted">Тип сесії</span>
                  <span className="font-medium text-ink">
                    {serviceType === "couple" ? "Парна терапія" : "Індивідуальна терапія"}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Дата й час</span>
                <span className="font-medium text-ink">
                  {nearestDay.date.toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                  })}
                  ,{" "}
                  {formatSlotRange(
                    combineDateAndTime(nearestDay.date, selectedTime),
                    activeDurationMinutes
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Тривалість</span>
                <span className="font-medium text-ink">{activeDurationMinutes} хв</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-ink-muted">Ціна</span>
                <span className="font-medium text-ink">{activePriceUah} ₴</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              className="mt-4 w-full rounded-full bg-sage px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage/90"
            >
              Оплатити
            </button>
            <p className="mt-2 text-center text-xs text-ink-muted">Оплата в розробці</p>
          </div>
        </div>
      )}
    </div>
  );
}
