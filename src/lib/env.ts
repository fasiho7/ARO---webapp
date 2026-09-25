/**
 * Public environment variables. Next.js inlines NEXT_PUBLIC_* into the
 * client bundle, so this file must never read server-only secrets.
 *
 * Do not add Judge0 keys or any other backend secret here.
 */
export const publicEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/** API base URL for all backend calls. Uses NEXT_PUBLIC_API_URL for both server and browser. */
export function clientApiBase(): string {
  return publicEnv.apiUrl.replace(/\/$/, "");
}

export function isSupabasePublicConfigured(): boolean {
  return (
    publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0
  );
}
