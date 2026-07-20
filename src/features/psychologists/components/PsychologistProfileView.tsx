"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { usePsychologist } from "../hooks/usePsychologist";
import { PsychologistSidebarCard } from "./PsychologistSidebarCard";
import { VideoIntroBlock } from "./VideoIntroBlock";
import { GeneralInfoBlock } from "./GeneralInfoBlock";
import { TopicsBlock } from "./TopicsBlock";
import { ProfileInfoSections } from "./ProfileInfoSections";
import { ReviewsList } from "./ReviewsList";
import { SlotPicker } from "./SlotPicker";
import { FAQAccordion } from "./FAQAccordion";
import type { SlotServiceType } from "../utils/generateFakeSlots";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export function PsychologistProfileView({ id }: { id: string }) {
  const { data, isLoading } = usePsychologist(id);
  const [serviceType, setServiceType] = useState<SlotServiceType>("individual");

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand" />
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Calmi", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: data.fullName },
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
