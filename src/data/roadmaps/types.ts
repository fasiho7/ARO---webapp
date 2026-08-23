export type RoadmapDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type TopicDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type ProjectLevel = "beginner" | "intermediate" | "advanced" | "portfolio";
export type PracticeKind =
  | "coding"
  | "exercise"
  | "quiz"
  | "debug"
  | "project"
  | "task"
  | "lab";
export type RoadmapCategory =
  | "Development"
  | "AI"
  | "Security"
  | "Data"
  | "Cloud";
export type RoadmapIcon =
  | "cpu"
  | "brain"
  | "layout"
  | "server"
  | "layers"
  | "smartphone"
  | "shield"
  | "chart"
  | "cloud"
  | "database"
  | "bug";

export type SkillGroups = {
  core: string[];
  technical: string[];
  tools: string[];
  soft: string[];
  interview: string[];
};

export type PracticeItem = {
  kind: PracticeKind;
  summary: string;
  /** Future hook into Coding Platform. Not wired yet. */
  codingHint?: {
    track?: "pf" | "oop" | "dsa";
    topic?: string;
  };
};

export type RoadmapTopic = {
  id: string;
  stageId: string;
  order: number;
  title: string;
  description: string;
  difficulty: TopicDifficulty;
  estimatedTime: string;
  prerequisites: string[];
  skills: string[];
  practice: PracticeItem;
  completionCriteria: string[];
};

export type RoadmapStage = {
  id: string;
  careerId: string;
  order: number;
  title: string;
  description: string;
  whyItMatters: string;
  estimatedTime: string;
  prerequisites: string[];
  topics: RoadmapTopic[];
  practice: PracticeItem[];
  projectIds: string[];
  milestoneId?: string;
  completionCriteria: string[];
};

export type RoadmapProject = {
  id: string;
  careerId: string;
  stageId?: string;
  title: string;
  level: ProjectLevel;
  description: string;
  skills: string[];
  requirements: string[];
  expectedOutcome: string;
};

export type RoadmapMilestone = {
  id: string;
  careerId: string;
  order: number;
  title: string;
  description: string;
  stageIds: string[];
  competence: string[];
};

export type InterviewPrep = {
  summary: string;
  technical: string[];
  problemSolving: string[];
  projects: string[];
  behavioral: string[];
  portfolio: string[];
};

export type CareerRoadmap = {
  id: string;
  slug: string;
  title: string;
  category: RoadmapCategory;
  icon: RoadmapIcon;
  shortDescription: string;
  description: string;
  whoItsFor: string[];
  whatYouDo: string[];
  difficulty: RoadmapDifficulty;
  estimatedTime: string;
  timeNote: string;
  prerequisites: string[];
  skills: SkillGroups;
  tools: string[];
  typicalRoles: string[];
  stages: RoadmapStage[];
  projects: RoadmapProject[];
  milestones: RoadmapMilestone[];
  interviewPrep: InterviewPrep;
  jobReadiness: string[];
  outcomes: string[];
};

export type RoadmapProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

/** Shape for authenticated roadmap progress. */
export type RoadmapProgressRecord = {
  careerId: string;
  stageId?: string;
  topicId?: string;
  projectId?: string;
  milestoneId?: string;
  status: RoadmapProgressStatus;
  completionDate?: string;
};

export type StageUnlockState =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";
