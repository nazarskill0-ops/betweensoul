"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBlockedSlots } from "../api";

export const BLOCKED_SLOTS_QUERY_KEY = ["psychologist-dashboard", "blocked-slots"];

export function useBlockedSlots() {
  return useQuery({
    queryKey: BLOCKED_SLOTS_QUERY_KEY,
    queryFn: fetchBlockedSlots,
  });
}
