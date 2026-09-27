import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabasePublicConfigured, publicEnv } from "@/lib/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = new URL(request.url).origin;

  console.log("[auth/callback] start", { hasCode: !!code, configured: isSupabasePublicConfigured() });

  if (!isSupabasePublicConfigured() || !code) {
    console.log("[auth/callback] missing config or code, redirecting");
    return NextResponse.redirect(new URL("/", request.url));
  }

  const cookieStore = await cookies();
  const originUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", originUrl));

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error, data } = await supabase.auth.exchangeCodeForSession(code);
  console.log("[auth/callback] exchangeCodeForSession", { hasError: !!error, userExists: !!data?.user, sessionExists: !!data?.session });
  if (error) {
    console.log("[auth/callback] exchange error", { message: error.message });
    return response;
  }

  console.log("[auth/callback] cookies set");
  return response;
}
