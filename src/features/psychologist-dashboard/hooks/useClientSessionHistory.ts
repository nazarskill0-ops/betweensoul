"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClientSessionHistory } from "../api";

export function useClientSessionHistory() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "client-session-history"],
    queryFn: fetchClientSessionHistory,
  });
}
