"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabasePublicConfigured, publicEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

/**
 * Browser Supabase client (cookie session via @supabase/ssr).
 * One instance per tab — do not create extra clients.
 * Server code should import `server.ts`.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!isSupabasePublicConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
    );
  }

  return browserClient;
}
