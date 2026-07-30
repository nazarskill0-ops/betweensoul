"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePsychologistStatus } from "../api";
import type { PsychologistStatus } from "@/features/psychologists/schema";

export function useUpdatePsychologistStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileId,
      status,
    }: {
      profileId: string;
      status: PsychologistStatus;
    }) => updatePsychologistStatus(profileId, status),
    onSuccess: () => {
      // Toggle статусу в адмінці одразу впливає на те, що бачить каталог і
      // сторінка психолога — інвалідуємо обидва кеші.
      queryClient.invalidateQueries({ queryKey: ["admin", "psychologists"] });
      queryClient.invalidateQueries({ queryKey: ["psychologists"] });
      queryClient.invalidateQueries({ queryKey: ["psychologist"] });
    },
  });
}
