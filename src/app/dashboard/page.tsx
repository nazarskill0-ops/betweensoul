import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

// Temporary dashboard. Reads the user server-side; redirects out if not logged in.
// Real per-role dashboards come later. Proper route protection = middleware (todo).
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-5">
      <h1 className="font-display text-3xl">
        Привіт{profile?.full_name ? `, ${profile.full_name}` : ""}!
      </h1>
      <p className="text-ink-muted">
        Ви увійшли як <span className="font-medium text-ink">{user.email}</span>.
        Роль: <span className="font-medium text-ink">{profile?.role ?? "—"}</span>.
      </p>
      <SignOutButton />
    </main>
  );
}
