"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentClientUser } from "../api";

export function useCurrentClientUser() {
  return useQuery({
    queryKey: ["client-dashboard", "current-user"],
    queryFn: fetchCurrentClientUser,
  });
}
