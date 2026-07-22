"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAvailability } from "../api";

export function useAvailability() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "availability"],
    queryFn: fetchAvailability,
  });
}
