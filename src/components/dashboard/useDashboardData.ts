"use client";

import { useCodingProgress } from "@/components/coding/useCodingProgress";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCodingDashboardStats } from "@/lib/dashboard";

export function useDashboardData() {
  const { status, profile, user } = useAuth();
  const coding = useCodingProgress();
  const hasLocalCoding = coding.store.completedIds.length > 0;
  const loading = status === "loading" || (coding.syncing && !hasLocalCoding);

  return {
    user,
    profile,
    loading,
    error: coding.error,
    codingStats: getCodingDashboardStats(coding.store),
  };
}
