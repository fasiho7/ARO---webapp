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
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore auth session error
  }

  return headers;
}
