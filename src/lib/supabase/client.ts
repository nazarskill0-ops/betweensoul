import { createBrowserClient } from "@supabase/ssr";

/*
  Supabase client for use in the BROWSER (Client Components, event handlers).
  Uses the public anon key — safe to expose. All access is still gated by
  Row Level Security (RLS) policies in the database. See docs/DATA_MODEL.md.

  Usage:  const supabase = createClient();
*/
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
