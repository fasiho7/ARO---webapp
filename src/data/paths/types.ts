export type LearningPathId = "pf" | "oop" | "dsa";
export type PathDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type PathNodeStatus = "completed" | "current" | "locked";
export type PathStageStatus = "completed" | "current" | "locked";

export type LearningPathNode = {
  id: string;
  order: number;
  title: string;
  purpose: string;
  estimatedTime: string;
  difficulty: PathDifficulty;
  prerequisites: string[];
  codingTopicSlug?: string;
};

export type LearningPathStage = {
  id: string;
  order: number;
  title: string;
  purpose: string;
  nodes: LearningPathNode[];
};

export type LearningPath = {
  id: LearningPathId;
  slug: LearningPathId;
  shortName: string;
  title: string;
  shortDescription: string;
  difficulty: PathDifficulty;
  level: string;
  stopLabel: string;
  arc: string;
  stages: LearningPathStage[];
  nodes: LearningPathNode[];
};
