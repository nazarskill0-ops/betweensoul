"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPsychologistById } from "../api";

/** Полный профиль психолога для страницы /psychologist/[id]. */
export function usePsychologist(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["psychologist", id],
    queryFn: () => fetchPsychologistById(id),
    enabled: options?.enabled ?? true,
  });
}
