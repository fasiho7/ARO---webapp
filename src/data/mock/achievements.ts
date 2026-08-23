import type { Achievement } from "./types";

export const achievements: Achievement[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Complete your first learning activity.",
    earned: true,
    earnedOn: "12 Mar 2026",
    icon: "footprints",
  },
  {
    id: "seven-day-streak",
    title: "7 Day Streak",
    description: "Learn for 7 consecutive days.",
    earned: true,
    earnedOn: "14 Aug 2026",
    icon: "flame",
  },
  {
    id: "first-submission",
    title: "First Submission",
    description: "Submit your first coding solution.",
    earned: true,
    earnedOn: "28 Mar 2026",
    icon: "upload",
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    description: "Ask 25 AI Tutor questions.",
    earned: false,
    icon: "sparkles",
  },
  {
    id: "roadmap-starter",
    title: "Roadmap Starter",
    description: "Complete your first roadmap section.",
    earned: true,
    earnedOn: "4 Apr 2026",
    icon: "map",
  },
  {
    id: "problem-solver",
    title: "Problem Solver",
    description: "Solve 25 coding problems.",
    earned: false,
    icon: "trophy",
  },
];
