export const CODING_LANGUAGES = ["C++", "C", "Python", "Java"] as const;
export type CodingLanguage = (typeof CODING_LANGUAGES)[number];

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type TopicDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type CodingTrackId = "pf" | "oop" | "dsa";

export type CodingExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type CodingProblem = {
  slug: string;
  number: number;
  title: string;
  difficulty: ProblemDifficulty;
  summary: string;
  description: string;
  examples: CodingExample[];
  constraints: string[];
  hints: string[];
  starterCode: Record<CodingLanguage, string>;
  sampleStdin?: string;
  ioFormat?: string;
};

export type CodingTopic = {
  slug: string;
  title: string;
  description: string;
  difficulty: TopicDifficulty;
  problems: CodingProblem[];
};

export type CodingTrack = {
  id: CodingTrackId;
  slug: CodingTrackId;
  shortName: string;
  title: string;
  description: string;
  topics: CodingTopic[];
};
