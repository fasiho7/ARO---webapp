"use client";

import { ContinuePracticeCard } from "@/components/dashboard/ContinuePracticeCard";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { LearningSnapshotStats } from "@/components/dashboard/LearningSnapshotStats";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { TrackProgressCard } from "@/components/dashboard/TrackProgressCard";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, status } = useAuth();
  useEffect(() => {
    console.log("[Dashboard] render", { status, userExists: !!user });
  }, [status, user]);
  return (
    <div>
      <DashboardGreeting />
      <DashboardErrorBanner />
      <LearningSnapshotStats />

      <div className="mt-6">
        <TrackProgressCard />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecentActivityCard />
        <ContinuePracticeCard />
      </div>
    </div>
  );
}

function DashboardErrorBanner() {
  const { error } = useDashboardData();
  if (!error) {
    return null;
  }
  return (
    <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      Some progress could not be loaded. Showing what is saved for this account.
    </p>
  );
}
