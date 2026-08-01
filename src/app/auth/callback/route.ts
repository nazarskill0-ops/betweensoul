import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth redirect target. Exchanges the code for a session (sets cookies),
// then sends the user into the app.
/**
 * Приймаємо тільки відносний внутрішній шлях. Рядок з іншим хостом (або
 * протокол-відносний `//evil.com`) перетворив би колбек на відкритий редірект.
 */
function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const next = safeNextPath(searchParams.get("next"));
  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
