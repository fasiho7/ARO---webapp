"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function CallbackContent() {
  const router = useRouter();
  const next = "/dashboard";

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let cancelled = false;

    const waitForSession = async () => {
      // Wait for Supabase to exchange the OAuth code and establish session
      const maxAttempts = 20;
      for (let i = 0; i < maxAttempts; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) {
            router.replace(next);
            router.refresh();
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      // Fallback: redirect anyway after timeout
      if (!cancelled) {
        router.replace(next);
        router.refresh();
      }
    };

    waitForSession();

    return () => {
      cancelled = true;
    };
  }, [router, next]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">Completing sign in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-muted">Completing sign in…</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}
