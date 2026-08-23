"use client";

import { Code2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { StatCard } from "@/components/ui/StatCard";

export function LearningSnapshotStats() {
  const data = useDashboardData();

  if (data.loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  const { total, catalogTotal } = data.codingStats;
  const remaining = Math.max(catalogTotal - total, 0);

  return (
    <section>
      <p className="mb-3 font-mono text-[11px] tracking-wide text-muted uppercase">
        Overall coding progress
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Total solved"
          value={total}
          icon={Code2}
          hint={
            total === 0
              ? "No accepted submissions yet"
              : `Accepted submissions in Coding Practice`
          }
        />
        <StatCard
          label="Remaining"
          value={remaining}
          hint={
            catalogTotal > 0
              ? `${catalogTotal} problems in PF, OOP, and DSA`
              : "Coding Practice problems"
          }
        />
      </div>
    </section>
  );
}
