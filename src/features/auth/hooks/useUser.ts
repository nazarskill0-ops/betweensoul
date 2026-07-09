"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "client" | "psychologist" | "admin" | "manager";
  avatarUrl: string | null;
}

// The blessed way to read the logged-in user in a Client Component.
// Returns null when nobody is signed in.
export function useUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", user.id)
        .single();

      return {
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        role: profile?.role ?? "client",
        avatarUrl: profile?.avatar_url ?? null,
      };
    },
  });
}
