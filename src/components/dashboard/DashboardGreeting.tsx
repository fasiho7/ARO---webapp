"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { realFirstName } from "@/lib/auth/display";

export function DashboardGreeting() {
  const { profile, user, status } = useAuth();
  const { codingStats, loading } = useDashboardData();
  const name = realFirstName(profile, user);

  if (status === "loading" || loading) {
    return (
      <div className="mb-8">
        <div className="h-8 w-64 animate-pulse rounded bg-white/10 [data-theme=light]:bg-black/10" />
        <p className="mt-2 font-mono text-xs text-muted">Loading…</p>
      </div>
    );
  }

  const empty = codingStats.total === 0;
  const welcome = name ? `Welcome back, ${name}` : "Welcome";
  const message = empty
    ? "Solve problems in Coding Practice to see your progress here."
    : "Here is your Coding Practice progress.";

  return (
    <div className="mb-8">
      <h1 className="display text-2xl font-semibold sm:text-3xl">{welcome}</h1>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  );
}
