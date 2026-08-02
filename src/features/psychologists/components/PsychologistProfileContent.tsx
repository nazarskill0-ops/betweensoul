"use client";

import { useEffect, useState } from "react";
import type { PsychologistProfile } from "../schema";
import { PsychologistSidebarCard } from "./PsychologistSidebarCard";
import { VideoIntroBlock } from "./VideoIntroBlock";
import { GeneralInfoBlock } from "./GeneralInfoBlock";
import { TopicsBlock } from "./TopicsBlock";
import { ProfileInfoSections } from "./ProfileInfoSections";
import { ReviewsList } from "./ReviewsList";
import { SlotPicker } from "./SlotPicker";
import { FAQAccordion } from "./FAQAccordion";
import type { SlotServiceType } from "../utils/generateFakeSlots";

/**
 * Тіло публічного профілю психолога: секції + сайдбар + FAQ, без хлібних
 * крихт і без завантаження даних. Виділено з PsychologistProfileView, щоб та
 * сама верстка рендерилась і на сторінці /psychologist/[id], і всередині
 * результату підбору (/pidbir), де психолог уже є в пам'яті.
 *
 * Компонент тримає стан типу сесії (індивідуальна/парна) — його ділять між
 * собою сайдбар і слот-пікер, тож він живе тут, а не в кожному з них.
 */
export function PsychologistProfileContent({
  psychologist,
  initialServiceType = "individual",
}: {
  psychologist: PsychologistProfile;
  /** З якого типу сесії відкривати профіль (підбір знає це з анкети). */
  initialServiceType?: SlotServiceType;
}) {
  const [serviceType, setServiceType] = useState<SlotServiceType>(initialServiceType);

  // Дані вантажаться асинхронно, тож #booking з'являється в DOM вже після
  // того, як браузер спробував проскролити за хешем із посилання — доскролюємо вручну.
  useEffect(() => {
    if (window.location.hash === "#booking") {
      document
        .getElementById("booking")
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <VideoIntroBlock
            videoUrl={psychologist.videoUrl}
            avatarUrl={psychologist.avatarUrl}
            fullName={psychologist.fullName}
          />

          <GeneralInfoBlock psychologist={psychologist} />

          <TopicsBlock psychologist={psychologist} />

          <ProfileInfoSections psychologist={psychologist} />
          <ReviewsList reviews={psychologist.reviews} />

          <div id="booking">
            <SlotPicker
              psychologistId={psychologist.profileId}
              individualPriceMinor={psychologist.priceMinor}
              couplePriceMinor={psychologist.couplePriceMinor}
              coupleSessionDurationMinutes={psychologist.coupleSessionDurationMinutes}
              serviceType={serviceType}
              onServiceTypeChange={setServiceType}
            />
          </div>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <PsychologistSidebarCard
            psychologist={psychologist}
            serviceType={serviceType}
            onServiceTypeChange={setServiceType}
          />
        </div>
      </div>

      <FAQAccordion />
    </div>
  );
}
