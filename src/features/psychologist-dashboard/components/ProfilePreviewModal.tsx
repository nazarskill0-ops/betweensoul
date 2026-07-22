"use client";

import { useMemo } from "react";
import { PsychologistProfileView } from "@/features/psychologists/components/PsychologistProfileView";
import { usePsychologist } from "@/features/psychologists/hooks/usePsychologist";
import { TEMPLATED_PSYCHOLOGIST_ID } from "@/features/psychologists/utils/availabilityStore";
import type { ProfileFormValues } from "../schema";
import { buildPreviewProfile } from "../utils/buildPreviewProfile";
import { CloseIcon } from "./icons";

/**
 * Прев'ю профілю через ту саму публічну верстку (PsychologistProfileView), з
 * "чернетковими" даними форми редагування — включно з ще не збереженими
 * змінами. Базові поля, яких немає в формі кабінету (ім'я, вік, відгуки
 * тощо), беруться з реального каталожного запису психолога.
 */
export function ProfilePreviewModal({
  draft,
  onClose,
}: {
  draft: ProfileFormValues;
  onClose: () => void;
}) {
  const { data: base, isLoading } = usePsychologist(TEMPLATED_PSYCHOLOGIST_ID);
  const previewData = useMemo(
    () => (base ? buildPreviewProfile(base, draft) : null),
    [base, draft]
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sand">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-ink px-5 py-3 text-white">
        <p className="text-sm">
          Це попередній перегляд. Зміни ще не видно іншим користувачам, поки їх не
          підтвердить модератор.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
        >
          <CloseIcon className="h-4 w-4" />
          Закрити перегляд
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {isLoading || !previewData ? (
          <div className="h-96 animate-pulse rounded-card bg-white" />
        ) : (
          <PsychologistProfileView previewData={previewData} />
        )}
      </div>
    </div>
  );
}
