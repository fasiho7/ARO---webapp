export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type RoadmapCategory =
  | "Development"
  | "AI"
  | "Security"
  | "Data"
  | "Cloud";

export type NodeStatus = "completed" | "current" | "upcoming";

export type RoadmapNode = {
  id: string;
  title: string;
  status: NodeStatus;
  section: string;
};

export type Roadmap = {
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: Difficulty;
  estimatedTime: string;
  skillsCount: number;
  icon: "cpu" | "brain" | "layout" | "server" | "layers" | "smartphone" | "shield" | "chart" | "cloud";
  progressPercent: number;
  completedSteps: number;
  totalSteps: number;
  skills: string[];
  projects: string[];
  careerOutcomes: string[];
  nodes: RoadmapNode[];
};

export type ProblemTopic =
  | "Arrays"
  | "Strings"
  | "Linked Lists"
  | "Trees"
  | "Graphs"
  | "Recursion"
  | "Sorting"
  | "Searching"
  | "OOP";

export type ProblemExample = {
  input: string;
  output: string;
  explanation: string;
};

export type Problem = {
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: ProblemTopic;
  solved: boolean;
  attempted: boolean;
  acceptance: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  starterCode: Record<string, string>;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedOn?: string;
  icon: "footprints" | "flame" | "upload" | "sparkles" | "map" | "trophy";
};

export type Activity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "roadmap" | "coding" | "tutor" | "award";
};

export type ChatRole = "user" | "assistant";

export type ChatBlock =
  | { type: "text"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "tryThis"; prompt: string };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  blocks: ChatBlock[];
};

export type Conversation = {
  id: string;
  title: string;
  updated: string;
  messages: ChatMessage[];
};

export type CalendarDay = {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
};

export type WeeklyHours = {
  day: string;
  hours: number;
};
