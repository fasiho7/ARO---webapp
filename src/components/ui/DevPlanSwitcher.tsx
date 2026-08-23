"use client";

import { useEffect, useState } from "react";
import { UserCheck, Crown, ShieldAlert } from "lucide-react";

export function DevPlanSwitcher() {
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem("aro-dev-user");
    if (stored === "pro" || stored === "free") {
      setCurrentPlan(stored);
    }
  }, []);

  if (!mounted || process.env.NODE_ENV !== "development") {
    return null;
  }

  function switchUser(plan: "free" | "pro") {
    sessionStorage.setItem("aro-dev-user", plan);
    setCurrentPlan(plan);
    window.location.reload();
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-gold/40 bg-gold/10 px-3.5 py-2.5 font-mono text-xs text-gold">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 shrink-0 text-gold" />
        <span>
          <strong>DEV TEST MODE:</strong> Active identity:{" "}
          <span className="font-bold uppercase tracking-wider text-ink">
            {currentPlan === "pro" ? "👑 Pro Test User (test-pro@aro.local)" : "👤 Free Test User (test-free@aro.local)"}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => switchUser("free")}
          className={`flex items-center gap-1 rounded border px-2.5 py-1 transition ${
            currentPlan === "free"
              ? "border-gold bg-gold text-void font-bold"
              : "border-gold/30 bg-void/50 text-gold hover:bg-gold/20"
          }`}
        >
          <UserCheck className="size-3.5" /> 👤 Free Test User
        </button>
        <button
          type="button"
          onClick={() => switchUser("pro")}
          className={`flex items-center gap-1 rounded border px-2.5 py-1 transition ${
            currentPlan === "pro"
              ? "border-gold bg-gold text-void font-bold"
              : "border-gold/30 bg-void/50 text-gold hover:bg-gold/20"
          }`}
        >
          <Crown className="size-3.5" /> 👑 Pro Test User
        </button>
      </div>
    </div>
  );
}
