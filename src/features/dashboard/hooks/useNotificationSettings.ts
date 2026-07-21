"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotificationSettings } from "../api";

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["client-dashboard", "notification-settings"],
    queryFn: fetchNotificationSettings,
  });
}
