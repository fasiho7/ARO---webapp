"use client";

import { useLearningSnapshot } from "@/components/progress/useLearningSnapshot";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

export default function ProgressPage() {
  const snapshot = useLearningSnapshot();

  return (
    <div>
      <PageHeader
        title="Your Progress"
        description="Coding and roadmap completion from your Aro account. Streaks and activity heatmaps will come later — they are not invented here."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Problems solved" value={snapshot.problemsSolved} />
        <StatCard
          label="Roadmap topics"
          value={`${snapshot.roadmap.completed}/${snapshot.roadmap.total || 0}`}
        />
        <StatCard label="Roadmap progress" value={`${snapshot.roadmap.percent}%`} />
        <StatCard label="Career path" value={snapshot.career?.title ?? "Not set"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="display text-sm font-semibold">Roadmap</h2>
          {snapshot.career ? (
            <>
              <p className="mt-3 display text-2xl font-semibold">
                {snapshot.roadmap.percent}%
              </p>
              <ProgressBar className="mt-3" value={snapshot.roadmap.percent} />
              <p className="mt-2 text-xs text-muted">
                {snapshot.roadmap.completed} of {snapshot.roadmap.total} topics
                on {snapshot.career.title}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Choose a career path on Roadmaps to attach progress to this
              profile.
            </p>
          )}
        </Card>
        <Card>
          <h2 className="display text-sm font-semibold">Coding</h2>
          <p className="mt-3 display text-2xl font-semibold">
            {snapshot.problemsSolved}
          </p>
          <p className="mt-2 text-xs text-muted">
            Accepted submissions on your account. Attempted-but-unsolved counts
            are not stored yet.
          </p>
        </Card>
      </div>
    </div>
  );
}
