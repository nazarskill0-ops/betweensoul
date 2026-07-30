"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminPsychologists } from "../api";

export function useAdminPsychologists() {
  return useQuery({
    queryKey: ["admin", "psychologists"],
    queryFn: fetchAdminPsychologists,
  });
}
