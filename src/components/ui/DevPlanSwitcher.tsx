"use client";

import { useEffect, useState } from "react";
import { Crown, ShieldAlert, UserCheck } from "lucide-react";
import { usePlan } from "@/components/access/usePlan";
import { useAuth } from "@/components/providers/AuthProvider";

export function DevPlanSwitcher() {
  const { user } = useAuth();
  const { plan, devTesting } = usePlan();
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("aro-dev-user");
    if (stored === "pro" || stored === "free") setCurrentPlan(stored);
  }, []);

  if (
    !mounted ||
    !user ||
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_ENABLE_DEV_PRO_TESTING !== "true"
  ) {
    return null;
  }

  function switchPlan(nextPlan: "free" | "pro") {
    sessionStorage.setItem("aro-dev-user", nextPlan);
    setCurrentPlan(nextPlan);
    window.location.reload();
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-gold/40 bg-gold/10 px-3.5 py-2.5 font-mono text-xs text-gold">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 shrink-0" />
        <span>
          <strong>DEV TEST MODE:</strong>{" "}
          {devTesting ? `${plan.toUpperCase()} entitlement active` : "backend has not authorized this signed-in user"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => switchPlan("free")} className="flex items-center gap-1 rounded border border-gold/30 bg-void/50 px-2.5 py-1 hover:bg-gold/20">
          <UserCheck className="size-3.5" /> Free
        </button>
        <button type="button" onClick={() => switchPlan("pro")} className="flex items-center gap-1 rounded border border-gold/30 bg-void/50 px-2.5 py-1 hover:bg-gold/20">
          <Crown className="size-3.5" /> Pro
        </button>
      </div>
    </div>
  );
}
