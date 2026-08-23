"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { normalizePlan, type UserPlan } from "@/lib/access";

export function usePlan(): {
  plan: UserPlan;
  isPro: boolean;
  loading: boolean;
} {
  const { profile, status } = useAuth();
  const plan = normalizePlan(profile?.plan);
  return {
    plan,
    isPro: plan === "pro",
    loading: status === "loading",
  };
}
