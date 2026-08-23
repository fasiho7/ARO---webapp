"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useLearningSnapshot } from "@/components/progress/useLearningSnapshot";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { careerTitleForSlug } from "@/data/roadmaps/careerOptions";
import {
  initialsFromName,
  profileDisplayName,
  profileUsername,
} from "@/lib/auth/display";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const snapshot = useLearningSnapshot();
  const name = profileDisplayName(profile, user);
  const username = profileUsername(profile, user);
  const career = careerTitleForSlug(profile?.selected_career);

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl grad-bg text-xl font-semibold text-white">
          {initialsFromName(name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="display text-2xl font-semibold">{name}</h1>
          <p className="text-sm text-muted">@{username}</p>
          <p className="mt-2 text-sm text-ink">
            {profile?.email ?? user?.email ?? "No email on this profile yet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {career ? (
              <Badge tone="teal">{career}</Badge>
            ) : (
              <Badge>No career selected yet</Badge>
            )}
            <Badge tone={profile?.plan === "pro" ? "gold" : "muted"}>
              {profile?.plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {profile?.plan !== "pro" ? (
            <Button href="/upgrade">Aro Pro — Coming Soon</Button>
          ) : null}
          <Button href="/settings" variant="secondary">
            Edit settings
          </Button>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Problems solved" value={snapshot.problemsSolved} />
        <StatCard
          label="Roadmap topics"
          value={`${snapshot.roadmap.completed}/${snapshot.roadmap.total || 0}`}
        />
        <StatCard label="Roadmap progress" value={`${snapshot.roadmap.percent}%`} />
        <StatCard label="Career" value={career ?? "Not set"} />
      </div>
      {snapshot.career ? (
        <>
          <ProgressBar className="mt-4" value={snapshot.roadmap.percent} />
          <p className="mt-2 text-sm text-muted">
            {snapshot.roadmap.completed} of {snapshot.roadmap.total} topics on{" "}
            {snapshot.career.title}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Choose a career path on Roadmaps to track progress on this profile.
        </p>
      )}

      <Card className="mt-8">
        <h2 className="display text-lg font-semibold">This profile</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Awards, streaks, and activity history will attach to this account in a
          later step. Coding and roadmap completion already follow you after
          you sign in.
        </p>
      </Card>

      <div className="mt-6 max-w-xs">
        <LogoutButton />
      </div>
    </div>
  );
}
