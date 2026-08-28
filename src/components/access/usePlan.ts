"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { bearerAuthHeaders } from "@/lib/apiAuth";
import { normalizePlan, type UserPlan } from "@/lib/access";
import { publicEnv } from "@/lib/env";

export function usePlan(): {
  plan: UserPlan;
  isPro: boolean;
  loading: boolean;
  devTesting: boolean;
} {
  const { profile, status } = useAuth();
  const [serverPlan, setServerPlan] = useState<UserPlan | null>(null);
  const [devTesting, setDevTesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(
          `${publicEnv.apiUrl.replace(/\/$/, "")}/api/access/me`,
          { cache: "no-store", headers: await bearerAuthHeaders() },
        );
        const data = (await response.json()) as {
          plan?: unknown;
          devTesting?: { active?: unknown };
        };
        if (!cancelled && response.ok) {
          setServerPlan(normalizePlan(data.plan));
          setDevTesting(data.devTesting?.active === true);
        }
      } catch {
        if (!cancelled) {
          setServerPlan(null);
          setDevTesting(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [profile?.plan, status]);

  const plan = serverPlan ?? normalizePlan(profile?.plan);
  return {
    plan,
    isPro: plan === "pro",
    loading: status === "loading",
    devTesting,
  };
}
