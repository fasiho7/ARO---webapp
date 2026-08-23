"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecentActivityCard() {
  const data = useDashboardData();

  if (data.loading) {
    return <DashboardSkeleton />;
  }

  const items = data.codingStats.recent;

  return (
    <Card>
      <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
        Recent activity
      </p>
      {items.length === 0 ? (
        <EmptyState
          className="mt-4 border-0 bg-transparent px-0 py-8"
          title="No problems solved yet"
          description="Accepted submissions from Programming Fundamentals, OOP, and DSA will show up here."
          action={
            <Button href="/coding" size="sm">
              Start practicing
            </Button>
          }
        />
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
                <Check className="size-3.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <Link href={item.href} className="text-sm font-medium text-ink">
                  {item.title}
                </Link>
                <p className="text-xs text-muted">
                  {item.trackLabel} — {item.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
