"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCodingProgress } from "@/components/coding/useCodingProgress";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { resolveActiveCareer } from "@/lib/dashboard";
import { careerProgress } from "@/lib/roadmapProgress";

export function useLearningSnapshot() {
  const { profile } = useAuth();
  const { store: coding } = useCodingProgress();
  const { store: roadmap } = useRoadmapProgress();
  const career = resolveActiveCareer(profile?.selected_career, roadmap);
  const roadmapStats = career
    ? careerProgress(career, roadmap)
    : { completed: 0, total: 0, percent: 0 };

  return {
    problemsSolved: coding.completedIds.length,
    career: career ?? null,
    selectedCareerSlug: profile?.selected_career ?? null,
    continueHref: career ? `/roadmaps/${career.slug}` : "/roadmaps",
    roadmap: roadmapStats,
  };
}
