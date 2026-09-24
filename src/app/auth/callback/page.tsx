"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function CallbackContent() {
  const router = useRouter();
  // After OAuth, redirect to dashboard by default
  const next = "/dashboard";

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const timer = setTimeout(() => {
      router.replace(next);
      router.refresh();
    }, 500);
    return () => clearTimeout(timer);
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
