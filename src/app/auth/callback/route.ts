import { NextResponse } from "next/server";
import { DEFAULT_AUTH_REDIRECT, safeNextPath } from "@/lib/auth/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next") ?? DEFAULT_AUTH_REDIRECT);

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${origin}/login?error=confirm`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
