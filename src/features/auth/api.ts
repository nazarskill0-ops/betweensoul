import { createClient } from "@/lib/supabase/client";
import type { LoginValues, RegisterValues } from "./schema";

// Only place that calls Supabase Auth. The `role` sent on signup is just a
// claim — the DB trigger (0001_init.sql) decides the final role, so admin/manager
// can't be self-assigned.

export async function signIn({ email, password }: LoginValues) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapAuthError(error.message));
}

export async function signUp(
  { fullName, email, password }: RegisterValues,
  role: "client" | "psychologist"
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw new Error(mapAuthError(error.message));
  // Email confirmation on -> no session until the link is clicked.
  return { needsEmailConfirm: !data.session };
}

/**
 * `next` — куди повернути користувача після обміну коду на сесію. Потрібен
 * там, де вхід стається посеред іншого сценарію (наприклад, у модалці
 * підбору), і кидати людину в дашборд означало б загубити її прогрес.
 */
export async function signInWithGoogle(next?: string) {
  const supabase = createClient();
  const callback = new URL("/auth/callback", window.location.origin);
  if (next) callback.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  if (error) throw new Error("Не вдалося увійти через Google");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Невірний email або пароль";
  if (message.includes("already registered"))
    return "Користувач з таким email вже існує";
  if (message.includes("Password should be")) return "Пароль занадто короткий";
  return "Щось пішло не так. Спробуйте ще раз";
}
