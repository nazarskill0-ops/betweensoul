"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { usePsychologist } from "../hooks/usePsychologist";
import { useUser } from "@/features/auth/hooks/useUser";
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
import { getFirstName } from "../utils/formatters";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

/**
 * `previewData` дозволяє відрендерити цю саму публічну верстку з "чернетковими"
 * (ще не збереженими) даними — використовується кабінетом психолога для
 * прев'ю "як побачать клієнти". Коли передано previewData, id не потрібен і
 * реальний фетч не відбувається.
 */
export function PsychologistProfileView({
  id,
  previewData,
}: {
  id?: string;
  previewData?: PsychologistProfile;
}) {
  const { data: fetchedData, isLoading } = usePsychologist(id ?? "", {
    enabled: !previewData && !!id,
  });
  const data = previewData ?? fetchedData;
  const { data: user, isLoading: isUserLoading } = useUser();
  const [serviceType, setServiceType] = useState<SlotServiceType>("individual");

  // Дані вантажаться асинхронно, тож #booking з'являється в DOM вже після
  // того, як браузер спробував проскролити за хешем із посилання — доскролюємо вручну.
  useEffect(() => {
    if (data && window.location.hash === "#booking") {
      document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [data]);

  if (!previewData && (isLoading || isUserLoading)) {
    return (
      <div className="h-96 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand" />
    );
  }

  if (!data) {
    notFound();
  }

  // Неопубліковані профілі бачить лише сам психолог (кабінет — через
  // previewData, сюди взагалі не заходить) та адмін (перегляд перед
  // публікацією з /admin/psychologists). Для решти — як і не існує.
  if (!previewData && data.status !== "approved" && user?.role !== "admin") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Calmi", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: getFirstName(data.fullName) },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <VideoIntroBlock
            videoUrl={data.videoUrl}
            avatarUrl={data.avatarUrl}
            fullName={data.fullName}
          />

          <GeneralInfoBlock psychologist={data} />

          <TopicsBlock psychologist={data} />

          <ProfileInfoSections psychologist={data} />
          <ReviewsList reviews={data.reviews} />

          <div id="booking">
            <SlotPicker
              psychologistId={data.profileId}
              individualPriceMinor={data.priceMinor}
              couplePriceMinor={data.couplePriceMinor}
              coupleSessionDurationMinutes={data.coupleSessionDurationMinutes}
              serviceType={serviceType}
              onServiceTypeChange={setServiceType}
            />
          </div>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <PsychologistSidebarCard
            psychologist={data}
            serviceType={serviceType}
            onServiceTypeChange={setServiceType}
          />
        </div>
      </div>

      <FAQAccordion />
    </div>
  );
}
