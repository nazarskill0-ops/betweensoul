"use client";

import { useState } from "react";
import { usePsychologist } from "@/features/psychologists/hooks/usePsychologist";
import { CloseIcon } from "@/features/psychologists/components/icons";
import { SlotPicker } from "@/features/psychologists/components/SlotPicker";
import type { SlotServiceType } from "@/features/psychologists/utils/generateFakeSlots";

export function RebookModal({
  psychologistId,
  psychologistName,
  psychologistAvatarUrl,
  onClose,
}: {
  psychologistId: string;
  psychologistName: string;
  psychologistAvatarUrl: string | null;
  onClose: () => void;
}) {
  const { data: psychologist, isLoading } = usePsychologist(psychologistId);
  const [serviceType, setServiceType] = useState<SlotServiceType>("individual");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="flex max-h-[85vh] flex-col gap-3 overflow-y-auto rounded-card">
          <div className="flex shrink-0 items-center gap-3 rounded-card bg-white p-4">
            {psychologistAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={psychologistAvatarUrl}
                alt={psychologistName}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-full bg-sage-light" />
            )}
            <p className="font-medium text-ink">{psychologistName}</p>
          </div>

          {isLoading || !psychologist ? (
            <div className="h-96 shrink-0 animate-pulse rounded-card bg-white" />
          ) : (
            <SlotPicker
              psychologistId={psychologist.profileId}
              individualPriceMinor={psychologist.priceMinor}
              couplePriceMinor={psychologist.couplePriceMinor}
              coupleSessionDurationMinutes={psychologist.coupleSessionDurationMinutes}
              serviceType={serviceType}
              onServiceTypeChange={setServiceType}
              onBack={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
