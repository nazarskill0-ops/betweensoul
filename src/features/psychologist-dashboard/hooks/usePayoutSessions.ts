"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPayoutSessions } from "../api";

export function usePayoutSessions() {
  return useQuery({
    queryKey: ["psychologist-dashboard", "payout-sessions"],
    queryFn: fetchPayoutSessions,
  });
}
