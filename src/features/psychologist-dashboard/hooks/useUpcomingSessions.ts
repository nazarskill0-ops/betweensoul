"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUpcomingSessions } from "../api";

export function useUpcomingSessions() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "upcoming-sessions"],
    queryFn: fetchUpcomingSessions,
  });
}
