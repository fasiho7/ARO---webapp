"use client";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function TrackProgressCard() {
  const data = useDashboardData();

  if (data.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardSkeleton />
        <DashboardSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <section>
      <p className="mb-3 font-mono text-[11px] tracking-wide text-muted uppercase">
        Track progress
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {data.codingStats.tracks.map((track) => (
          <Card key={track.id}>
            <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
              {track.shortName}
            </p>
            <h2 className="display mt-2 text-lg font-semibold">{track.title}</h2>
            <p className="mt-2 text-sm text-muted">
              {track.solved} solved
              {track.total > 0 ? ` of ${track.total}` : ""}
            </p>
            <ProgressBar className="mt-4" value={track.percent} />
            <p className="mt-2 text-sm text-teal">{track.percent}%</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
