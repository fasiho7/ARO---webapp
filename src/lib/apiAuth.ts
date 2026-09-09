import { isSupabasePublicConfigured } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function bearerAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_PRO_TESTING === "true" &&
    typeof window !== "undefined"
  ) {
    const devUser = sessionStorage.getItem("aro-dev-user");
    if (devUser === "pro" || devUser === "free") {
      headers["x-aro-dev-test-plan"] = devUser;
    }
  }

  if (!isSupabasePublicConfigured()) {
    return headers;
  }

  try {
    const supabase = createBrowserSupabaseClient();
    // proxy.ts (Next.js 16 middleware) refreshes the Supabase cookie before
    // the page renders, so getSession() always returns a valid, current token.
    // Using getUser() caused a race: it fires a server round-trip that can
    // complete after the component useEffect, returning no token on first load
    // and triggering the backend 401 "Sign in to continue." error on /quiz.
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore auth errors — unauthenticated requests proceed without a token.
  }

  return headers;
}
