"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}
