"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAvailabilityExceptions } from "../api";

export function useAvailabilityExceptions() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "availability-exceptions"],
    queryFn: fetchAvailabilityExceptions,
  });
}
