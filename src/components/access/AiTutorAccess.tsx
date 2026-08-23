"use client";

import type { ReactNode } from "react";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { canAccessAiTutor } from "@/lib/access";
import { ACCESS_COPY } from "@/lib/access";
import { TutorWorkspace } from "@/components/tutor/TutorWorkspace";

export function AiTutorAccess({ children }: { children?: ReactNode }) {
  const { plan, loading } = usePlan();

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!canAccessAiTutor(plan)) {
    return (
      <UpgradePrompt
        title="AI Tutor"
        description={ACCESS_COPY.aiTutor}
      />
    );
  }

  return children ?? <TutorWorkspace />;
}
