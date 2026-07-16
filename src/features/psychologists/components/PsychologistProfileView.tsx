"use client";

import { notFound } from "next/navigation";
import { usePsychologist } from "../hooks/usePsychologist";
import { PsychologistSidebarCard } from "./PsychologistSidebarCard";
import { VideoIntroBlock } from "./VideoIntroBlock";
import { EducationTimeline } from "./EducationTimeline";
import { ReviewsList } from "./ReviewsList";
import { SlotPicker } from "./SlotPicker";
import { FAQAccordion } from "./FAQAccordion";

export function PsychologistProfileView({ id }: { id: string }) {
  const { data, isLoading } = usePsychologist(id);

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand" />
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="order-2 flex flex-col gap-8 lg:order-1">
        <VideoIntroBlock
          videoUrl={data.videoUrl}
          avatarUrl={data.avatarUrl}
          fullName={data.fullName}
        />

        <div className="flex flex-col gap-4">
          {data.aboutMe && (
            <div className="rounded-card bg-sage-light p-4">
              <p className="text-sm italic text-ink-muted">"{data.aboutMe}"</p>
            </div>
          )}

          {data.specializations.length > 0 && (
            <div className="flex flex-col gap-2 rounded-card bg-sage-light p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-sage">
                Методи роботи
              </span>
              <div className="flex flex-wrap gap-2">
                {data.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full bg-white px-3 py-1.5 text-sm text-ink"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <EducationTimeline education={data.education} />
        <ReviewsList reviews={data.reviews} />

        <div id="booking">
          <SlotPicker
            psychologistId={data.profileId}
            individualPriceMinor={data.priceMinor}
            couplePriceMinor={data.couplePriceMinor}
            coupleSessionDurationMinutes={data.coupleSessionDurationMinutes}
          />
        </div>

        <FAQAccordion />
      </div>

      <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <PsychologistSidebarCard psychologist={data} />
      </div>
    </div>
  );
}
