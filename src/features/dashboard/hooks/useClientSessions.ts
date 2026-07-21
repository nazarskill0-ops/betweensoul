"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClientSessions } from "../api";

export function useClientSessions() {
  return useQuery({
    queryKey: ["client-dashboard", "sessions"],
    queryFn: fetchClientSessions,
  });
}
