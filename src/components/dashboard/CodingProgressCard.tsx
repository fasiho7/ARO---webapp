"use client";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CodingProgressCard() {
  const data = useDashboardData();

  if (data.loading) {
    return <DashboardSkeleton />;
  }

  const { total } = data.codingStats;

  return (
    <Card>
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        Coding progress
      </p>
      <h2 className="display mt-2 text-xl font-semibold">
        {total} {total === 1 ? "problem" : "problems"} solved
      </h2>
      <p className="mt-2 text-sm text-muted">
        {total === 0
          ? "No accepted submissions yet."
          : "From accepted submissions in Coding Practice."}
      </p>
      <Button href="/coding" className="mt-5" variant="secondary">
        {total === 0 ? "Start practicing" : "Continue practice"}
      </Button>
    </Card>
  );
}
