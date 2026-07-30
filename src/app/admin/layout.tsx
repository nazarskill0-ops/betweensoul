import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardShell } from "@/features/admin/components/AdminDashboardShell";

// Єдиний захищений вхід в адмінку: без сесії — на /login, без ролі admin — на
// головну. Робиться тут (не в middleware), щоб не чіпати спільний
// src/lib/supabase/middleware.ts заради одного роута.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-dvh">
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </div>
  );
}
