"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFavoritePsychologists } from "../api";

export function useFavoritePsychologists() {
  return useQuery({
    queryKey: ["client-dashboard", "favorite-psychologists"],
    queryFn: fetchFavoritePsychologists,
  });
}
