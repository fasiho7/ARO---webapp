import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_AUTH_REDIRECT,
  isAuthPath,
  isProtectedPath,
  safeNextPath,
} from "@/lib/auth/routes";
import { isSupabasePublicConfigured, publicEnv } from "@/lib/env";

/**
 * Refresh the Auth cookie and gate protected app routes.
 * If public Supabase env is missing, skip gating so local Coding/Roadmaps still work.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabasePublicConfigured()) {
    return supabaseResponse;
  }

  console.log("[proxy] updateSession start", { pathname: request.nextUrl.pathname });

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[proxy] supabase.auth.getUser", { serverUserExists: !!user, pathname: request.nextUrl.pathname });

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    console.log("[proxy] redirect to login", { pathname, protected: isProtectedPath(pathname) });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    url.pathname = next === "/login" || next === "/signup" ? DEFAULT_AUTH_REDIRECT : next;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
