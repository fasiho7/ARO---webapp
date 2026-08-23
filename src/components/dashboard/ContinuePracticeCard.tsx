"use client";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ContinuePracticeCard() {
  const data = useDashboardData();

  if (data.loading) {
    return <DashboardSkeleton />;
  }

  const empty = data.codingStats.total === 0;

  return (
    <Card>
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        Continue practice
      </p>
      <h2 className="display mt-2 text-xl font-semibold">
        {empty ? "Start Coding Practice" : "Keep practicing"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Work through Programming Fundamentals, Object-Oriented Programming, and
        Data Structures & Algorithms.
      </p>
      <Button href="/coding" className="mt-5">
        {empty ? "Start practicing" : "Continue practice"}
      </Button>
    </Card>
  );
}
