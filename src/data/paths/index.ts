import { getTopic } from "@/data/coding";
import { learningPaths } from "./catalog";
import type { LearningPath, LearningPathId, LearningPathNode } from "./types";

export { learningPaths } from "./catalog";
export type {
  LearningPath,
  LearningPathId,
  LearningPathNode,
  LearningPathStage,
  PathDifficulty,
  PathNodeStatus,
  PathStageStatus,
} from "./types";

export function getLearningPath(slug: string): LearningPath | undefined {
  return learningPaths.find((item) => item.slug === slug);
}

export function isLearningPathId(value: string): value is LearningPathId {
  return value === "pf" || value === "oop" || value === "dsa";
}

export function practiceHref(
  pathId: LearningPathId,
  node: LearningPathNode,
): string | null {
  if (!node.codingTopicSlug) {
    return null;
  }
  if (!getTopic(pathId, node.codingTopicSlug)) {
    return null;
  }
  return `/coding/${pathId}/${node.codingTopicSlug}`;
}

export function pathHref(pathId: LearningPathId, nodeId?: string): string {
  return nodeId ? `/roadmaps/${pathId}#${nodeId}` : `/roadmaps/${pathId}`;
}
