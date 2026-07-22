"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWeeklyCalendar } from "../api";

export function useWeeklyCalendar() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "weekly-calendar"],
    queryFn: fetchWeeklyCalendar,
  });
}
