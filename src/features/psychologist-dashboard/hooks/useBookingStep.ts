"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBookingStepMinutes } from "../api";

export const BOOKING_STEP_QUERY_KEY = ["psychologist-dashboard", "booking-step"];

export function useBookingStep() {
  return useQuery({
    queryKey: BOOKING_STEP_QUERY_KEY,
    queryFn: fetchBookingStepMinutes,
  });
}
