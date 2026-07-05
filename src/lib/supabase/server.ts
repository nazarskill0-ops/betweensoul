import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  Supabase client for use on the SERVER (Server Components, Route Handlers,
  Server Actions). Reads the logged-in user's session from cookies so RLS
  runs as that user.

  Usage (must be awaited, cookies() is async in Next 15+):
    const supabase = await createClient();
    const { data } = await supabase.from("psychologists").select();
*/
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Safe to ignore when middleware refreshes the session.
          }
        },
      },
    }
  );
}
