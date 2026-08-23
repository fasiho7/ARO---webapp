import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabasePublicConfigured, publicEnv } from "@/lib/env";

/**
 * Server Supabase client for Server Components, Route Handlers, and Server Actions.
 * Session cookies are the source of truth. Do not create another auth system.
 */
export async function createServerSupabaseClient() {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // The proxy refreshes the session cookies instead.
        }
      },
    },
  });
}
